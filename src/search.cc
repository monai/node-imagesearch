#include <iostream>
#include <cmath>
#include <vector>

#include <node.h>
#include <node_buffer.h>

#include <Eigen/Dense>

using namespace v8;

typedef Eigen::Map<Eigen::Matrix<int, -1, -1, Eigen::RowMajor> > MatrixChannel;
typedef struct {
	unsigned int rows;
	unsigned int cols;
	MatrixChannel r;
	MatrixChannel g;
	MatrixChannel b;
} Matrix;

typedef struct {
	unsigned int row;
	unsigned int col;
	double accuracy;
} Match;

std::vector<Match> search(Matrix &m1, Matrix &m2, unsigned int colorTolerance, unsigned int pixelTolerance);

Handle<Value> Search(const Arguments& args) {
	HandleScope scope;
	
	const unsigned int colorTolerance = args[2]->IsNumber() ? args[2]->Int32Value() : 0;
	const unsigned int pixelTolerance = args[3]->IsNumber() ? args[3]->Int32Value() : 0;
	
	Handle<Object> matrix1 = Handle<Object>::Cast(args[0]);
	Handle<Object> matrix2 = Handle<Object>::Cast(args[1]);
	
	Local<String> rows = String::New("rows");
	Local<String> cols = String::New("cols");
	Local<String> data = String::New("data");
	
	if ( ! matrix1->Has(rows) || ! matrix1->Has(cols) || ! matrix1->Has(data)) {
		return ThrowException(Exception::TypeError(String::New("Bad argument 'imgMatrix'")));
	}
	
	if ( ! matrix2->Has(rows) || ! matrix2->Has(cols) || ! matrix2->Has(data)) {
		return ThrowException(Exception::TypeError(String::New("Bad argument 'tplMatrix'")));
	}
	
	const unsigned int m1Rows = matrix1->Get(rows)->Int32Value();
	const unsigned int m1Cols = matrix1->Get(cols)->Int32Value();
	
	const unsigned int m2Rows = matrix2->Get(rows)->Int32Value();
	const unsigned int m2Cols = matrix2->Get(cols)->Int32Value();
	
	Handle<Object> m1Data = Handle<Object>::Cast(matrix1->Get(data));
	Handle<Object> m2Data = Handle<Object>::Cast(matrix2->Get(data));
	
	Local<String> r = String::New("r");
	Local<String> g = String::New("g");
	Local<String> b = String::New("b");
	
	if ( ! m1Data->Has(r) || ! m1Data->Has(g) || ! m1Data->Has(b)) {
		return ThrowException(Exception::TypeError(String::New("Bad argument 'imgMatrix'")));
	}
	
	if ( ! m2Data->Has(r) || ! m2Data->Has(g) || ! m2Data->Has(b)) {
		return ThrowException(Exception::TypeError(String::New("Bad argument 'tplMatrix'")));
	}
	
	Handle<Value> m1R = m1Data->Get(r);
	Handle<Value> m1G = m1Data->Get(g);
	Handle<Value> m1B = m1Data->Get(b);
	
	Handle<Value> m2R = m2Data->Get(r);
	Handle<Value> m2G = m2Data->Get(g);
	Handle<Value> m2B = m2Data->Get(b);
	
	size_t m1RL = node::Buffer::Length(m1R->ToObject());
	char* m1RD = node::Buffer::Data(m1R->ToObject());
	int* m1RDi = (int*) &m1RD[0];
	
	size_t m1GL = node::Buffer::Length(m1G->ToObject());
	char* m1GD = node::Buffer::Data(m1G->ToObject());
	int* m1GDi = (int*) &m1GD[0];
	
	size_t m1BL = node::Buffer::Length(m1B->ToObject());
	char* m1BD = node::Buffer::Data(m1B->ToObject());
	int* m1BDi = (int*) &m1BD[0];
	
	size_t m2RL = node::Buffer::Length(m2R->ToObject());
	char* m2RD = node::Buffer::Data(m2R->ToObject());
	int* m2RDi = (int*) &m2RD[0];
	
	size_t m2GL = node::Buffer::Length(m2G->ToObject());
	char* m2GD = node::Buffer::Data(m2G->ToObject());
	int* m2GDi = (int*) &m2GD[0];
	
	size_t m2BL = node::Buffer::Length(m2B->ToObject());
	char* m2BD = node::Buffer::Data(m2B->ToObject());
	int* m2BDi = (int*) &m2BD[0];
	
	if (m1RL != m1GL || m1RL != m1BL) {
		return ThrowException(Exception::TypeError(String::New("Bad argument 'imgMatrix.data'")));
	}
	
	if (m2RL != m2GL || m2RL != m2BL) {
		return ThrowException(Exception::TypeError(String::New("Bad argument 'tplMatrix.data'")));
	}
	
	MatrixChannel m1RMat(m1RDi, m1Rows, m1Cols);
	MatrixChannel m1GMat(m1GDi, m1Rows, m1Cols);
	MatrixChannel m1BMat(m1BDi, m1Rows, m1Cols);
	
	MatrixChannel m2RMat(m2RDi, m2Rows, m2Cols);
	MatrixChannel m2GMat(m2GDi, m2Rows, m2Cols);
	MatrixChannel m2BMat(m2BDi, m2Rows, m2Cols);
	
	Matrix m1 = {
		m1Rows,
		m1Cols,
		m1RMat,
		m1GMat,
		m1BMat
	};
	
	Matrix m2 = {
		m2Rows,
		m2Cols,
		m2RMat,
		m2GMat,
		m2BMat
	};
	
	std::vector<Match> result = search(m1, m2, colorTolerance, pixelTolerance);
	Local<Array> out = Array::New((int) result.size());
	Local<Object> match;
	
	int i = 0;
	for (std::vector<Match>::iterator it = result.begin(); it != result.end(); it++) {
		
		match = Object::New();
		match->Set(String::New("row"), Number::New(it->row));
		match->Set(String::New("col"), Number::New(it->col));
		match->Set(String::New("accuracy"), Number::New(it->accuracy));
		
		out->Set(i++, match);
	}
	
	return scope.Close(out);
}

std::vector<Match> search(Matrix &m1, Matrix &m2, unsigned int colorTolerance, unsigned int pixelTolerance) {
	
	const unsigned int dx = (const unsigned int) std::floor(m2.cols / 2);
	
	Eigen::VectorXi stubR = m2.r.block(0, dx, m2.rows, 1);
	Eigen::VectorXi stubG = m2.g.block(0, dx, m2.rows, 1);
	Eigen::VectorXi stubB = m2.b.block(0, dx, m2.rows, 1);
	
	Eigen::ArrayXi stubDiff;
	Eigen::ArrayXXi matDiff;
	Eigen::MatrixXd matAcc;
	
	unsigned int r = 0;
	unsigned int c = dx;
	const unsigned int mr = m1.rows - m2.rows;
	const unsigned int mc = m1.cols - m2.cols + c;
	
	unsigned int pixelMiss = 0;
	double accuracy = 0;
	
	std::vector<Match> out;
	
	do {
		do {
			stubDiff   = (m1.r.block(r, c, m2.rows, 1) - stubR).array().abs();
			pixelMiss  = (unsigned int) (stubDiff > colorTolerance).count();
			if (pixelMiss > pixelTolerance) continue;
			
			stubDiff  += (m1.g.block(r, c, m2.rows, 1) - stubG).array().abs();
			pixelMiss += (unsigned int) (stubDiff > colorTolerance).count();
			if (pixelMiss > pixelTolerance) continue;
			
			stubDiff  += (m1.b.block(r, c, m2.rows, 1) - stubB).array().abs();
			pixelMiss += (unsigned int) (stubDiff > colorTolerance).count();
			if (pixelMiss > pixelTolerance) continue;
			
			matDiff  = (m1.r.block(r, c - dx, m2.rows, m2.cols) - m2.r).array().abs();
			matDiff += (m1.g.block(r, c - dx, m2.rows, m2.cols) - m2.g).array().abs();
			matDiff += (m1.b.block(r, c - dx, m2.rows, m2.cols) - m2.b).array().abs();
			
			pixelMiss = (unsigned int) (matDiff > colorTolerance).count();
			if (pixelMiss <= pixelTolerance) {
				
				matAcc = matDiff.cast<double>();
				accuracy = matAcc.maxCoeff();
				accuracy = (accuracy > 0) ? (matAcc / accuracy).sum() : 0;
				
				Match res = {
					r,
					(c - dx),
					accuracy
				};
				out.push_back(res);
			}
		} while (++c <= mc);
		c = dx;
	} while (++r <= mr);
	
	return out;
}

void Init(Handle<Object> exports) {
	exports->Set(String::NewSymbol("search"), FunctionTemplate::New(Search)->GetFunction());
}

NODE_MODULE(search, Init)
