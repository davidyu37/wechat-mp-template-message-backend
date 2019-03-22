require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser')
const logger = require('morgan');

const app = express();

// For Calling WeChat API
const axios = require('axios');

// WeChat Stuff
const { Wechat, MiniProgram } = require('wechat-jssdk');

const wechatConfig = {
  "appId": process.env.APP_ID,
  "appSecret": process.env.APP_SECRET,
  "miniProgram": {
    "appId": process.env.APP_ID,
    "appSecret": process.env.APP_SECRET,
  }
};
const wx = new Wechat(wechatConfig);

app.use(logger('dev'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.get('/login', async (req, res) => {
  const session = await wx.miniProgram.getSession(req.query.code);
  res.json(session);
});


app.post('/save-formId', async (req, res) => {
  // save form ID here, to send a message to a user who didn't trigger the form.
})

app.use('/send-message', async (req, res) => {
  /*
  {
    "form_id": "1d16026cadf5fef48705f8dc416120dc",
    "touser": 'oIEcc5CTl4nRK1hORoSghj19N-GA', // openID
    "template_id":'epDAg_fFYdvsVD5qDLS2jpxXU45wfNWME36q1HMjgTg',
    "data": {
      keyword1: {
        value: 'Product Name',
      },
      keyword2: {
        value: 'Product Description',
      },
      keyword3: {
        value: '10/10/2018',
      },
      keyword4: {
        value: '10/10/2018',
      },
    },
  }
  */
  try {
    // Get access token
   const { access_token } = await wx.jssdk.getAccessToken();
  //  console.log(access_token);
   // Get template id either hardcoded or making a request to https://api.weixin.qq.com/cgi-bin/wxopen/template/list?access_token=ACCESS_TOKEN
   const template_id = "rOCU8DIXCI1FBIxhg8zpUGyqnYhqT2obhj70Hn8VK2M";
   // Send message
   const message = {
      form_id: req.body.form_id,
      // Recipient's OpenID
      touser: req.body.touser,
      template_id,
      data: {
        keyword1: {
          value: '10/10/2018',
        },
        keyword2: {
          value: 'Product Name',
        },
        keyword3: {
          value: 'Delivery Platform',
        },
      }
    };

   const response = await axios.post(`https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=${access_token}`, message);

    res.status(200).json(response.data);
 } catch (e) {
   console.error(e.message || e);
   res.status(500).json({ error: e.message || e });
 }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
