const express=require('express');

const cors=require('cors');
const bodyParser=require('body-parser');
const {createCluster}=require('./ClusterCreation/index.js');

const app=express();
app.use(cors());
app.use(bodyParser.urlencoded({limit: "400mb", extended: true, parameterLimit:50000000}));
app.use(bodyParser.json({limit: "400mb"}));

createCluster(app);

