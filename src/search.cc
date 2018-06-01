#include <iostream>
#include <cmath>
#include <vector>

#include <uv.h>
#include <node.h>
#include <node_buffer.h>

#include <Eigen/Dense>
#include <nan.h>

#include "search.h"

using namespace v8;

void Search(const Nan::FunctionCallbackInfo<v8::Value> &args) {
    v8::Isolate *isolate = args.GetIsolate();
    v8::HandleScope scope(isolate);

    Local<String> rows = Nan::New("rows").ToLocalChecked();
    Local<String> cols = Nan::New("cols").ToLocalChecked();
    Local<String> data = Nan::New("data").ToLocalChecked();
    Local<String> channels = Nan::New("channels").ToLocalChecked();

    // unwrap arguments
    Handle<Object> matrix1 = Handle<Object>::Cast(args[0]);
    Handle<Object> matrix2 = Handle<Object>::Cast(args[1]);
    
    const unsigned int colorTolerance = args[2]->IsNumber() ? args[2]->Int32Value() : 0;
    const unsigned int pixelTolerance = args[3]->IsNumber() ? args[3]->Int32Value() : 0;
    
    //Local<Function> localCallback = Local<Function>::Cast(args[4]);
    //Persistent<Function> callback = Persistent<Function>::New(isolate, localCallback);
    v8::Persistent<v8::Function> callback;
    callback.Reset(isolate, Local<Function>::Cast(args[4]));
    
    // check for required matrix properties
    if ( ! matrix1->Has(rows) || ! matrix1->Has(cols) || ! matrix1->Has(channels) || ! matrix1->Has(data)) {
        Nan::ThrowTypeError("Bad argument 'imgMatrix'");
        //return ThrowException(Exception::TypeError(Nan::New("Bad argument 'imgMatrix'").ToLocalChecked));
    }
    
    if ( ! matrix2->Has(rows) || ! matrix2->Has(cols) || ! matrix2->Has(channels) || ! matrix2->Has(data)) {
        Nan::ThrowTypeError("Bad argument 'tplMatrix'");
        //return ThrowException(Exception::TypeError(Nan::New("Bad argument 'tplMatrix'")));
    }
    
    // unwrap matrices
    const unsigned int m1Rows = matrix1->Get(rows)->Uint32Value();
    const unsigned int m1Cols = matrix1->Get(cols)->Uint32Value();
    //MaybeLocal<Uint32> m1Channels = Nan::ToArrayIndex(Nan::Get(matrix1, channels).ToLocalChecked());
    const unsigned int m1Channels = matrix1->Get(channels)->Uint32Value();
    
    const unsigned int m2Rows = matrix2->Get(rows)->Uint32Value();
    const unsigned int m2Cols = matrix2->Get(cols)->Uint32Value();
    const unsigned int m2Channels = matrix2->Get(channels)->Uint32Value();
    
    // channel count validation
    if (m1Channels < 1 || m2Channels < 1 || m1Channels > 4 || m2Channels > 4) {
        Nan::ThrowTypeError("Bad number of channels");
        //return ThrowException(Exception::TypeError(String::New("Bad number of channels")));
    }
    
    if (abs((int) m2Channels - (int) m1Channels) > 1) {
        Nan::ThrowTypeError("Channel mismatch");
        //return ThrowException(Exception::TypeError(String::New("Channel mismatch")));
    }
    
    // unwrap matrix.data
    Handle<Object> m1Data = Handle<Object>::Cast(matrix1->Get(data));
    Handle<Object> m2Data = Handle<Object>::Cast(matrix2->Get(data));
    
    // TODO: consider removal of channels property
    // declared and actual channel count validation
    if (m1Channels != m1Data->Get(Nan::New("length").ToLocalChecked())->Uint32Value()) {
        Nan::ThrowTypeError("Bad argument 'imgMatrix'");
        //return ThrowException(Exception::TypeError(String::New("Bad argument 'imgMatrix'")));
    }
    
    if (m2Channels != m2Data->Get(Nan::New("length").ToLocalChecked())->Uint32Value()) {
        Nan::ThrowTypeError("Bad argument 'tplMatrix'");
        //return ThrowException(Exception::TypeError(String::New("Bad argument 'tplMatrix'")));
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
    
    if (m1Channels == 2) {
        m1A = Handle<Object>::Cast(m1Data->Get(1));
    } else if (m1Channels == 4) {
        m1A = Handle<Object>::Cast(m1Data->Get(3));
    }
    
    if (m2Channels == 1 || m2Channels == 2) {
        m2K = Handle<Object>::Cast(m2Data->Get(0));
    } else if (m2Channels == 3 || m2Channels == 4) {
        m2R = Handle<Object>::Cast(m2Data->Get(0));
        m2G = Handle<Object>::Cast(m2Data->Get(1));
        m2B = Handle<Object>::Cast(m2Data->Get(2));
    }
    
    if (m2Channels == 2) {
        m2A = Handle<Object>::Cast(m2Data->Get(1));
    } else if (m2Channels == 4) {
        m2A = Handle<Object>::Cast(m2Data->Get(3));
    }
    
    // unwrap channel buffers
    size_t m1KL, m1RL, m1GL, m1BL, m1AL;
    char *m1KD, *m1RD, *m1GD, *m1BD, *m1AD;
    float *m1KDi, *m1RDi, *m1GDi, *m1BDi, *m1ADi;
    
    m1KL = m1RL = m1GL = m1BL = m1AL = 0;
    m1KDi = m1RDi = m1GDi = m1BDi = m1ADi = 0;
    
    size_t m2KL, m2RL, m2GL, m2BL, m2AL;
    char *m2KD, *m2RD, *m2GD, *m2BD, *m2AD;
    float *m2KDi, *m2RDi, *m2GDi, *m2BDi, *m2ADi;
    
    m2KL = m2RL = m2GL = m2BL = m2AL = 0;
    m2KDi = m2RDi = m2GDi = m2BDi = m2ADi = 0;
    
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
    if (m1Channels == 2 && m1KL != m1AL) {
        Nan::ThrowTypeError("Bad argument 'imgMatrix.data'");
        //return ThrowException(Exception::TypeError(String::New("Bad argument 'imgMatrix.data'")));
    } else if (m1Channels == 3 && (m1RL != m1GL || m1RL != m1BL)) {
        Nan::ThrowTypeError("Bad argument 'imgMatrix.data'");
        //return ThrowException(Exception::TypeError(String::New("Bad argument 'imgMatrix.data'")));
    } else if (m1Channels == 4 && (m1RL != m1GL || m1RL != m1BL || m1RL != m1AL)) {
        Nan::ThrowTypeError("Bad argument 'imgMatrix.data'");
        //return ThrowException(Exception::TypeError(String::New("Bad argument 'imgMatrix.data'")));
    }
    
    if (m2Channels == 2 && m2KL != m2AL) {
        Nan::ThrowTypeError("Bad argument 'tplMatrix.data'");
        //return ThrowException(Exception::TypeError(String::New("Bad argument 'tplMatrix.data'")));
    } else if (m2Channels == 3 && (m2RL != m2GL || m2RL != m2BL)) {
        Nan::ThrowTypeError("Bad argument 'tplMatrix.data'");
        //return ThrowException(Exception::TypeError(String::New("Bad argument 'tplMatrix.data'")));
    } else if (m2Channels == 4 && (m2RL != m2GL || m2RL != m2BL || m2RL != m2AL)) {
        Nan::ThrowTypeError("Bad argument 'tplMatrix.data'");
        //return ThrowException(Exception::TypeError(String::New("Bad argument 'tplMatrix.data'")));
    }
    
    Cargo *m1 = new Cargo;
    m1->rows = m1Rows;
    m1->cols = m1Cols;
    m1->channels = m1Channels;
    m1->k = m1KDi;
    m1->r = m1RDi;
    m1->g = m1GDi;
    m1->b = m1BDi;
    m1->a = m1ADi;
    
    Cargo *m2 = new Cargo;
    m2->rows = m2Rows;
    m2->cols = m2Cols;
    m2->channels = m2Channels;
    m2->k = m2KDi;
    m2->r = m2RDi;
    m2->g = m2GDi;
    m2->b = m2BDi;
    m2->a = m2ADi;
    
    AsyncBaton *baton = new AsyncBaton;
    baton->request.data = baton;
    baton->callback.Reset(isolate, callback);
    baton->m1 = m1;
    baton->m2 = m2;
    baton->colorTolerance = colorTolerance;
    baton->pixelTolerance = pixelTolerance;
    
    uv_queue_work(uv_default_loop(), &baton->request, searchDo, (uv_after_work_cb) searchAfter);
    
    //return Nan::Undefined();
}

void searchDo(uv_work_t *request) {
    AsyncBaton *baton = static_cast<AsyncBaton*>(request->data);
    Cargo *m1D = static_cast<Cargo*>(baton->m1);
    Cargo *m2D = static_cast<Cargo*>(baton->m2);
    
    Matrix m1 = {
        m1D->rows,
        m1D->cols,
        m1D->channels,
        MatrixChannel(m1D->k, m1D->rows, m1D->cols),
        MatrixChannel(m1D->r, m1D->rows, m1D->cols),
        MatrixChannel(m1D->g, m1D->rows, m1D->cols),
        MatrixChannel(m1D->b, m1D->rows, m1D->cols),
        MatrixChannel(m1D->a, m1D->rows, m1D->cols)
    };
    
    Matrix m2 = {
        m2D->rows,
        m2D->cols,
        m2D->channels,
        MatrixChannel(m2D->k, m2D->rows, m2D->cols),
        MatrixChannel(m2D->r, m2D->rows, m2D->cols),
        MatrixChannel(m2D->g, m2D->rows, m2D->cols),
        MatrixChannel(m2D->b, m2D->rows, m2D->cols),
        MatrixChannel(m2D->a, m2D->rows, m2D->cols)        
    };
    
    std::vector<Match> result = search(m1, m2, baton->colorTolerance, baton->pixelTolerance);
    baton->result = result;
}

void searchAfter(uv_work_t *request) {
    v8::Isolate *isolate = Isolate::GetCurrent();
    AsyncBaton *baton = static_cast<AsyncBaton*>(request->data);
    
    Local<Array> out = Array::New(isolate, baton->result.size());
    Local<Object> match;
    
    Local<String> row = Nan::New("row").ToLocalChecked();
    Local<String> col = Nan::New("col").ToLocalChecked();
    Local<String> accuracy = Nan::New("accuracy").ToLocalChecked();
    
    int i = 0;
    for (std::vector<Match>::iterator it = baton->result.begin(); it != baton->result.end(); it++) {
        match = Object::New(isolate);
        match->Set(row, Number::New(isolate, it->row));
        match->Set(col, Number::New(isolate, it->col));
        match->Set(accuracy, Number::New(isolate, it->accuracy));
        
        out->Set(i++, match);
    }
    
    Handle<Value> argv[] = { Nan::Null(), out };
    Local<Function> callback = Local<Function>::New(isolate, baton->callback);
    callback->Call(Nan::GetCurrentContext()->Global(), 2, argv);
    
    delete baton;
    baton = NULL;
}

std::vector<Match> search(Matrix &m1, Matrix &m2, unsigned int colorTolerance, unsigned int pixelTolerance) {
    Eigen::RowVectorXf devK, devR, devG, devB, devA;
    Eigen::RowVectorXf dev = Eigen::RowVectorXf::Zero(m2.cols);
    
    if (m1.channels < 3) {
        devK = stdDev(m2.k);
        dev += devK;
    } else {
        devR = stdDev(m2.r);
        devG = stdDev(m2.g);
        devB = stdDev(m2.b);
        dev += devR + devG + devB;
    }
    
    Eigen::RowVectorXf::Index maxCol;
    dev.maxCoeff(&maxCol);
    const unsigned int dx = (const unsigned int) maxCol;
    
    float* dataM1;
    float* dataM2;
    
    if (m1.channels < 3) {
        dataM1 = &m1.k(0);
        dataM2 = &m2.k(0);
    } else {
        if (devR.sum() > devG.sum()) {
            dataM1 = &m1.r(0);
            dataM2 = &m2.r(0);
        } else if (devG.sum() > devB.sum()) {
            dataM1 = &m1.g(0);
            dataM2 = &m2.g(0);
        } else {
            dataM1 = &m1.b(0);
            dataM2 = &m2.b(0);
        }
    }
    
    MatrixChannel stubM1(dataM1, m1.rows, m1.cols);
    MatrixChannel stubM2(dataM2, m2.rows, m2.cols);
    
    Eigen::VectorXf stub = stubM2.block(0, dx, m2.rows, 1);
    Eigen::ArrayXf stubDiff;
    Eigen::ArrayXXf matDiff;
    
    unsigned int r = 0;
    unsigned int c = dx;
    const unsigned int mr = m1.rows - m2.rows;
    const unsigned int mc = m1.cols - m2.cols + c;
    
    // TODO: adjust point colot tolerance according to alpha channel
    // unsigned int pointColorTolerance = 0;
    unsigned int pixelMiss = 0;
    float accuracy = 0;
    
    std::vector<Match> out;
    do {
        do {
            stubDiff = (stubM1.block(r, c, m2.rows, 1) - stub).array().abs();
            pixelMiss = (unsigned int) (stubDiff > (float) colorTolerance).count();
            if (pixelMiss > pixelTolerance) continue;
            
            if (m1.channels < 3) {
                matDiff  = (m1.k.block(r, c - dx, m2.rows, m2.cols) - m2.k).array().abs();
            } else {
                matDiff  = (m1.r.block(r, c - dx, m2.rows, m2.cols) - m2.r).array().abs();
                matDiff += (m1.g.block(r, c - dx, m2.rows, m2.cols) - m2.g).array().abs();
                matDiff += (m1.b.block(r, c - dx, m2.rows, m2.cols) - m2.b).array().abs();
            }
            
            pixelMiss = (unsigned int) (matDiff > (float) colorTolerance).count();
            
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

Eigen::RowVectorXf stdDev(MatrixChannel &m) {
    const unsigned int N = (unsigned int) m.rows();
    return ((m.rowwise() - (m.colwise().sum() / (float) N)).array().square().colwise().sum() / (float) N).array().sqrt();
}

void Init(v8::Local<v8::Object> exports) {
    //Isolate *isolate = Isolate::GetCurrent();
    //exports->Set(Nan::New("search"), FunctionTemplate::New(isolate, Search)->GetFunction());
    //v8::Local<v8::FunctionTemplate> tpl = Nan::New<v8::FunctionTemplate>(Search);
    //Nan::Set(exports, Nan::New("Search").ToLocalChecked(), tpl->GetFunction());
    exports->Set(Nan::New("search").ToLocalChecked(), Nan::New<v8::FunctionTemplate>(Search)->GetFunction());
}

NODE_MODULE(search, Init)
