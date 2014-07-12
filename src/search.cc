#include <iostream>
#include <cmath>
#include <vector>
#include <string.h>

#include <uv.h>
#include <node.h>
#include <node_buffer.h>

#include <Eigen/Dense>

#include "search.h"

using namespace v8;

Handle<Value> Search(const Arguments& args) {
    HandleScope scope;
    
    Local<String> rows = String::New("rows");
    Local<String> cols = String::New("cols");
    Local<String> data = String::New("data");
    Local<String> channels = String::New("channels");
    
    // unwrap arguments
    Handle<Object> matrix1 = Handle<Object>::Cast(args[0]);
    Handle<Object> matrix2 = Handle<Object>::Cast(args[1]);
    
    const unsigned int colorTolerance = args[2]->IsNumber() ? args[2]->Int32Value() : 0;
    const unsigned int pixelTolerance = args[3]->IsNumber() ? args[3]->Int32Value() : 0;
    
    Persistent<Function> callback = Persistent<Function>::New(Local<Function>::Cast(args[4]));
    
    // checko for required matrix properties
    if ( ! matrix1->Has(rows) || ! matrix1->Has(cols) || ! matrix1->Has(data)) {
        return ThrowException(Exception::TypeError(String::New("Bad argument 'imgMatrix'")));
    }
    
    if ( ! matrix2->Has(rows) || ! matrix2->Has(cols) || ! matrix2->Has(data)) {
        return ThrowException(Exception::TypeError(String::New("Bad argument 'tplMatrix'")));
    }
    
    // unwrap matrices
    const unsigned int m1Rows = matrix1->Get(rows)->Uint32Value();
    const unsigned int m1Cols = matrix1->Get(cols)->Uint32Value();
    const unsigned int m1Channels = matrix1->Get(channels)->Uint32Value();
    
    const unsigned int m2Rows = matrix2->Get(rows)->Uint32Value();
    const unsigned int m2Cols = matrix2->Get(cols)->Uint32Value();
    const unsigned int m2Channels = matrix2->Get(channels)->Uint32Value();
    
    // channel count validation
    if ((m2Channels - m1Channels) > 1) {
        return ThrowException(Exception::TypeError(String::New("Channel Mismatch")));
    }
    
    if (m1Channels > 4) {
        return ThrowException(Exception::TypeError(String::New("Bad number of channels")));
    }
    
    // unwrap matrix.data
    Handle<Object> m1Data = Handle<Object>::Cast(matrix1->Get(data));
    Handle<Object> m2Data = Handle<Object>::Cast(matrix2->Get(data));
    
    // TODO: consider removal of channels property
    // declared and actual channel count validation
    if (m1Channels != m1Data->Get(String::New("length"))->Uint32Value()) {
        return ThrowException(Exception::TypeError(String::New("Bad argument 'imgMatrix'")));
    }
    
    if (m2Channels != m2Data->Get(String::New("length"))->Uint32Value()) {
        return ThrowException(Exception::TypeError(String::New("Bad argument 'tplMatrix'")));
    }
    
    // unwrap matrix.data channels
    Handle<Object> m1K, m1R, m1G, m1B, m1A;
    Handle<Object> m2K, m2R, m2G, m2B, m2A;
    
    // TODO: check matrix data type
    if (m1Channels == 1 || m1Channels == 2) {
        m1K = Handle<Object>::Cast(m1Data->Get(0));
    } else if (m1Channels == 3 || m1Channels == 4) {
        m1R = Handle<Object>::Cast(m1Data->Get(0));
        m1G = Handle<Object>::Cast(m1Data->Get(1));
        m1B = Handle<Object>::Cast(m1Data->Get(2));
    }
    
    if (m1Channels == 2 || m1Channels == 4) {
        m1A = Handle<Object>::Cast(m1Data->Get(3));
    }
    
    if (m2Channels == 1 || m2Channels == 2) {
        m2K = Handle<Object>::Cast(m2Data->Get(0));
    } else if (m2Channels == 3 || m2Channels == 4) {
        m2R = Handle<Object>::Cast(m2Data->Get(0));
        m2G = Handle<Object>::Cast(m2Data->Get(1));
        m2B = Handle<Object>::Cast(m2Data->Get(2));
    }
    
    if (m2Channels == 2 || m2Channels == 4) {
        m2A = Handle<Object>::Cast(m2Data->Get(3));
    }
    
    // unwrap channel buffers
    size_t m1KL, m1RL, m1GL, m1BL, m1AL;
    char *m1KD, *m1RD, *m1GD, *m1BD, *m1AD;
    float *m1KDi, *m1RDi, *m1GDi, *m1BDi, *m1ADi;
    
    size_t m2KL, m2RL, m2GL, m2BL, m2AL;
    char *m2KD, *m2RD, *m2GD, *m2BD, *m2AD;
    float *m2KDi, *m2RDi, *m2GDi, *m2BDi, *m2ADi;
    
    if (m2Channels == 1 || m2Channels == 2) {
        m1KL = node::Buffer::Length(m1K) * sizeof(float);
        m1KD = node::Buffer::Data(m1K);
        m1KDi = (float *) malloc(m1KL);
        memcpy(m1KDi, &m1KD[0], m1KL);
        
        m2KL = node::Buffer::Length(m2K) * sizeof(float);
        m2KD = node::Buffer::Data(m2K);
        m2KDi = (float *) malloc(m2KL);
        memcpy(m2KDi, &m2KD[0], m2KL);
    }
    
    if (m2Channels == 3 || m2Channels == 4) {
        m1RL = node::Buffer::Length(m1R) * sizeof(float);
        m1RD = node::Buffer::Data(m1R);
        m1RDi = (float *) malloc(m1RL);
        memcpy(m1RDi, &m1RD[0], m1RL);
        
        m1GL = node::Buffer::Length(m1G) * sizeof(float);
        m1GD = node::Buffer::Data(m1G);
        m1GDi = (float *) malloc(m1GL);
        memcpy(m1GDi, &m1GD[0], m1GL);
        
        m1BL = node::Buffer::Length(m1B) * sizeof(float);
        m1BD = node::Buffer::Data(m1B);
        m1BDi = (float *) malloc(m1BL);
        memcpy(m1BDi, &m1BD[0], m1BL);
        
        m2RL = node::Buffer::Length(m2R) * sizeof(float);
        m2RD = node::Buffer::Data(m2R);
        m2RDi = (float *) malloc(m2RL);
        memcpy(m2RDi, &m2RD[0], m2RL);
        
        m2GL = node::Buffer::Length(m2G) * sizeof(float);
        m2GD = node::Buffer::Data(m2G);
        m2GDi = (float *) malloc(m2GL);
        memcpy(m2GDi, &m2GD[0], m2GL);
        
        m2BL = node::Buffer::Length(m2B) * sizeof(float);
        m2BD = node::Buffer::Data(m2B);
        m2BDi = (float *) malloc(m2BL);
        memcpy(m2BDi, &m2BD[0], m2BL);
    }
    
    if (m1Channels == 2 || m1Channels == 4) {
        m1AL = node::Buffer::Length(m1A) * sizeof(float);
        m1AD = (char*) node::Buffer::Data(m1A);
        m1ADi = (float *) malloc(m1AL);
        memcpy(m1ADi, &m1AD[0], m1AL);
    }
    
    if (m2Channels == 2 || m2Channels == 4) {
        m2AL = node::Buffer::Length(m2A) * sizeof(float);
        m2AD = (char*) node::Buffer::Data(m2A);
        m2ADi = (float *) malloc(m2AL);
        memcpy(m2ADi, &m2AD[0], m2AL);
    }
    
    // validate channel buffer lengths
    if (m1Channels == 2) {
        if (m1KL != m1AL) {
            return ThrowException(Exception::TypeError(String::New("Bad argument 'imgMatrix.data'")));
        }
        
        if (m2KL != m2AL) {
            return ThrowException(Exception::TypeError(String::New("Bad argument 'tplMatrix.data'")));
        }
    } else if (m1Channels == 3) {
        if (m1RL != m1GL || m1RL != m1BL) {
            return ThrowException(Exception::TypeError(String::New("Bad argument 'imgMatrix.data'")));
        }
        
        if (m2RL != m2GL || m2RL != m2BL) {
            return ThrowException(Exception::TypeError(String::New("Bad argument 'tplMatrix.data'")));
        }
    } else if (m1Channels == 4) {
        if (m1RL != m1GL || m1RL != m1BL || m1RL != m1AL) {
            return ThrowException(Exception::TypeError(String::New("Bad argument 'imgMatrix.data'")));
        }
        
        if (m2RL != m2GL || m2RL != m2BL || m2RL != m2AL) {
            return ThrowException(Exception::TypeError(String::New("Bad argument 'tplMatrix.data'")));
        }
    }
    
    MatrixChannel *m1KMat = new MatrixChannel(m1KDi, m1Rows, m1Cols);
    MatrixChannel *m1RMat = new MatrixChannel(m1RDi, m1Rows, m1Cols);
    MatrixChannel *m1GMat = new MatrixChannel(m1GDi, m1Rows, m1Cols);
    MatrixChannel *m1BMat = new MatrixChannel(m1BDi, m1Rows, m1Cols);
    MatrixChannel *m1AMat = new MatrixChannel(m1ADi, m1Rows, m1Cols);
    
    MatrixChannel *m2KMat = new MatrixChannel(m2KDi, m2Rows, m2Cols);
    MatrixChannel *m2RMat = new MatrixChannel(m2RDi, m2Rows, m2Cols);
    MatrixChannel *m2GMat = new MatrixChannel(m2GDi, m2Rows, m2Cols);
    MatrixChannel *m2BMat = new MatrixChannel(m2BDi, m2Rows, m2Cols);
    MatrixChannel *m2AMat = new MatrixChannel(m2ADi, m2Rows, m2Cols);
    
    Matrix *m1 = new Matrix;
    m1->rows = m1Rows;
    m1->cols = m1Cols;
    m1->channels = m1Channels;
    m1->k = m1KMat;
    m1->r = m1RMat;
    m1->g = m1GMat;
    m1->b = m1BMat;
    m1->a = m1AMat;
    
    Matrix *m2 = new Matrix;
    m2->rows = m2Rows;
    m2->cols = m2Cols;
    m2->channels = m2Channels;
    m2->k = m2KMat;
    m2->r = m2RMat;
    m2->g = m2GMat;
    m2->b = m2BMat;
    m2->a = m2AMat;
    
    AsyncBaton *baton = new AsyncBaton;
    baton->request.data = baton;
    baton->callback = callback;
    baton->m1 = m1;
    baton->m2 = m2;
    baton->colorTolerance = colorTolerance;
    baton->pixelTolerance = pixelTolerance;
    
    uv_queue_work(uv_default_loop(), &baton->request, searchDo, (uv_after_work_cb)searchAfter);
    
    return Undefined();
}

void searchDo(uv_work_t *request) {
    AsyncBaton *baton = static_cast<AsyncBaton*>(request->data);
    Matrix *m1 = static_cast<Matrix*>(baton->m1);
    Matrix *m2 = static_cast<Matrix*>(baton->m2);
    
    std::vector<Match> result = search(m1, m2, baton->colorTolerance, baton->pixelTolerance);
    baton->result = result;
}

void searchAfter(uv_work_t *request) {
    AsyncBaton *baton = static_cast<AsyncBaton*>(request->data);
    
    Local<Array> out = Array::New((int) baton->result.size());
    Local<Object> match;
    
    Local<String> row = String::New("row");
    Local<String> col = String::New("col");
    Local<String> accuracy = String::New("accuracy");
    
    int i = 0;
    for (std::vector<Match>::iterator it = baton->result.begin(); it != baton->result.end(); it++) {
        match = Object::New();
        match->Set(row, Number::New(it->row));
        match->Set(col, Number::New(it->col));
        match->Set(accuracy, Number::New(it->accuracy));
        
        out->Set(i++, match);
    }
    
    Handle<Value> argv[] = { Null(), out };
    baton->callback->Call(Context::GetCurrent()->Global(), 2, argv);
    
    delete baton;
    baton = NULL;
}

std::vector<Match> search(Matrix *&m1, Matrix *&m2, unsigned int colorTolerance, unsigned int pixelTolerance) {
    Eigen::RowVectorXf devK, devR, devG, devB, devA;
    Eigen::RowVectorXf dev = Eigen::RowVectorXf::Zero(m2->cols);
    
    if (m1->channels < 3) {
        devK = stdDev(m2->k);
        dev += devK;
    } else {
        devR = stdDev(m2->r);
        devG = stdDev(m2->g);
        devB = stdDev(m2->b);
        dev += devR + devG + devB;
    }
    
    Eigen::RowVectorXf::Index maxCol;
    dev.maxCoeff(&maxCol);
    const unsigned int dx = (const unsigned int) maxCol;
    
    float* dataM1;
    float* dataM2;
    
    if (m1->channels < 3) {
        dataM1 = (float *) m1->k;
        dataM2 = (float *) m2->k;
    } else {
        if (devR.sum() > devG.sum()) {
            dataM1 = (float *) m1->r;
            dataM2 = (float *) m2->r;
        } else if (devG.sum() > devB.sum()) {
            dataM1 = (float *) m1->g;
            dataM2 = (float *) m2->g;
        } else {
            dataM1 = (float *) m1->b;
            dataM2 = (float *) m2->b;
        }
    }
    
    MatrixChannel stubM1(dataM1, m1->rows, m1->cols);
    MatrixChannel stubM2(dataM2, m2->rows, m2->cols);
    
    Eigen::VectorXf stub = stubM2.block(0, dx, m2->rows, 1);
    Eigen::ArrayXf stubDiff;
    Eigen::ArrayXXf matDiff;
    
    unsigned int r = 0;
    unsigned int c = dx;
    const unsigned int mr = m1->rows - m2->rows;
    const unsigned int mc = m1->cols - m2->cols + c;
    
    // TODO: adjust point colot tolerance according to alpha channel
    // unsigned int pointColorTolerance = 0;
    unsigned int pixelMiss = 0;
    float accuracy = 0;
    
    std::vector<Match> out;
    do {
        do {
            stubDiff = (stubM1.block(r, c, m2->rows, 1) - stub).array().abs();
            pixelMiss = (unsigned int) (stubDiff > colorTolerance).count();
            if (pixelMiss > pixelTolerance) continue;
            
            if (m1->channels < 3) {
                matDiff  = (m1->k->block(r, c - dx, m2->rows, m2->cols) - m2->k->block(0, 0, m2-> rows, m2->cols)).array().abs();
            } else {
                matDiff  = (m1->r->block(r, c - dx, m2->rows, m2->cols) - m2->r->block(0, 0, m2-> rows, m2->cols)).array().abs();
                matDiff += (m1->g->block(r, c - dx, m2->rows, m2->cols) - m2->g->block(0, 0, m2-> rows, m2->cols)).array().abs();
                matDiff += (m1->b->block(r, c - dx, m2->rows, m2->cols) - m2->b->block(0, 0, m2-> rows, m2->cols)).array().abs();
            }
            
            pixelMiss = (unsigned int) (matDiff > colorTolerance).count();
            
            if (pixelMiss <= pixelTolerance) {
                accuracy = matDiff.maxCoeff();
                accuracy = (accuracy > 0) ? (matDiff / accuracy).sum() : 0;
                
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

Eigen::RowVectorXf stdDev(MatrixChannel *&m) {
    const unsigned int N = m->rows();
    return ((m->rowwise() - (m->colwise().sum() / N)).array().square().colwise().sum() / N).array().sqrt();
}

void Init(Handle<Object> exports) {
    exports->Set(String::NewSymbol("search"), FunctionTemplate::New(Search)->GetFunction());
}

NODE_MODULE(search, Init)
