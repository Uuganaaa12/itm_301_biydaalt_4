const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const compression = require('compression');
require('dotenv').config();

const adminQuestionsRouter = require('./routes/admin/questions-routes');

const UserQuestionsRouter = require('./routes/user/questions-routes');

const NotificationsRouter = require('./routes/notification-routes');
const MessageRouter = require('./routes/message-routes');
const LostFoundRouter = require('./routes/lostFound-routes');
const TodoRouter = require('./routes/todo-routes');
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB is connected'))
  .catch(error => console.log(error));

const app = express();
const PORT = process.env.PORT || 5001;
const allowedOrigins = ['http://localhost:5173'];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Cache-Control',
    'Expires',
    'Pragma',
    'x-user-id',
  ],
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(compression());

app.use('/api/admin/questions', adminQuestionsRouter);

app.use('/api/user/questions', UserQuestionsRouter);
app.use('/api/notifications', NotificationsRouter);
app.use('/api/messages', MessageRouter);
app.use('/api/lost-found', LostFoundRouter);
app.use('/api/todos', TodoRouter);
app.listen(PORT, '0.0.0.0', () =>
  console.log(`Server is now running on port ${PORT}`)
);
