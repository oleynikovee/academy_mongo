'use strict'

const {mapUser, getRandomFirstName} = require('./util')

// db connection and settings
const connection = require('./config/connection')
let userCollection
let articleCollection
let studentCollection
run()

async function run() {
  await connection.connect()
  await connection.get().dropCollection('users')
  await connection.get().createCollection('users')
  await connection.get().dropCollection('articles')
  await connection.get().createCollection('articles')
  await connection.get().dropCollection('students')
  await connection.get().createCollection('students')
  userCollection = connection.get().collection('users')
  articleCollection=connection.get().collection('articles')
  studentCollection=connection.get().collection('students')
  //Users
  await example1()
  await example2()
  await example3()
  await example4()
  //Articles
  await example5()
  await example6()
  await example7()
  await example8()
  await example9()
  //Students
  await example10()
  await example11()
  await example12()
  await example13()
  await example14()
  await example15()
  await example16()
  await example17()
  await connection.close()
}

// #### Users

// - Create 2 users per department (a, b, c)
async function example1() {

  try {
    for(let i=0;i<6;i++){
      if(i==0||i==1){
        const result= await userCollection.insertOne(mapUser({department:'a'}));
      }
      if(i==2||i==3){
        const result= await userCollection.insertOne(mapUser({department:'b'}));
      }
      if(i==4||i==5){
        const result= await userCollection.insertOne(mapUser({department:'c'}));
      }
    }
  } catch (err) {
    console.error(err)
  }
}

// - Delete 1 user from department (a)

async function example2() {
  try {
    const result=await userCollection.deleteOne({"department":'a'});
  } catch (err) {
    console.error(err)
  }
}

// - Update firstName for users from department (b)

async function example3() {
  try {
    const result=await userCollection.updateMany(
      { "department" : "b"},
      {$set:{"firstName":'It`s work'}});
  } catch (err) {
    console.error(err)
  }
}

// - Find all users from department (c)
async function example4() {
  try {
    const result=await userCollection.find({ "department" : "c"}).toArray();
    console.log(result);
  } catch (err) {
    console.error(err)
  }
}

// #### Articles


//- Create 5 articles per each type (a, b, c)
async function example5() {

  try {
    for(let i=0;i<15;i++){
      if(i>=0&&i<=4){
        const result= await articleCollection.insertOne({
          name:  'Mongodb - introduction'+i,
          description: 'Mongodb - text',
          type: 'a',
          tags: []
      });
      }
      if(i>4&&i<=9){
        const result= await articleCollection.insertOne({
          name:  'Mongodb - introduction'+i,
          description: 'Mongodb - text',
          type: 'b',
          tags: []
      });
      }
      if(i>9&&i<=14){
        const result= await articleCollection.insertOne({
          name:  'Mongodb - introduction'+i,
          description: 'Mongodb - text',
          type: 'c',
          tags: []
      });
      }
    }
  } catch (err) {
    console.error(err)
  }
}
//-Find articles with type a, and update tag list with next value [‘tag1-a’, ‘tag2-a’, ‘tag3’]
async function example6() {
  try {
    const result=await articleCollection.updateMany(
      { "type" : "a"},
      {$set:{"tags":['tag1-a', 'tag2-a', 'tag3']}});
  } catch (err) {
    console.error(err)
  }
}
//-Add tags [‘tag2’, ‘tag3’, ‘super’] to other articles except articles from type a
async function example7() {
  try {
    const result=await articleCollection.updateMany(
      { "type" : {$ne:"a"}},
      {$set:{"tags":['tag2', 'tag3', 'super']}});
  } catch (err) {
    console.error(err)
  }
}
//-Find all articles that contains tags [tag2, tag1-a]
async function example8() {
  try {
    const result=await articleCollection.find({$or : [{"tags": "tag2"}, {"tags": "tag1-a"}]}).toArray();
    console.log(result);
  } catch (err) {
    console.error(err)
  }
}
//- Pull [tag2, tag1-a] from all articles
async function example9() {
  try {
    const result=await articleCollection.updateMany({},{$pullAll: {"tags":['tag2','tag1-a']}});
  } catch (err) {
    console.error(err)
  }
}
// #### Students

//-load json to db
async function example10() {
  try {
    let json=require('./students.json');
    let data=JSON.parse(JSON.stringify(json));
    for(let i=0;i<data.length;i++){
       await studentCollection.insertOne(data[i]);
    }
  } catch (err) {
    console.error(err)
  }
}
//- Find all students who have the worst score for homework, sort by descent
async function example11() {
  try {
    const result=await studentCollection.aggregate(
      [
        {$match:{"scores":{"type":{$in:['homework']}}}},
        {$group:{"_id":"$name","_score":"$scores.score"}},
        {$sort:{"_score":-1}}
      ]
    );
  } catch (err) {
    console.error(err)
  }
}
//-- Find all students who have the best score for quiz and the worst for homework, sort by ascending
async function example12() {
  try {
    const result=await studentCollection.aggregate(
      [
        {$sort:{$and:[{"scores.type":"homework"},{"scores.score":-1}],$and:[{"scores.type":"quiz"},{"scores.score":1}]}}
      ]
    );
  } catch (err) {
    console.error(err)
  }
}
//-- Find all students who have best scope for quiz and exam
async function example13() {
  try {
    const result=await studentCollection.aggregate(
      [
        {$sort:{$and:[{"scores.type":"quiz"},{"scores.score":1}],$and:[{"scores.type":"exam"},{"scores.score":1}]}}
      ]
    );
  } catch (err) {
    console.error(err)
  }
}
//- Calculate the average score for homework for all students
async function example14() {
  try {
    const result=await studentCollection.aggregate(
      [
        {$match:{"scores":{$in:['homework']}}},
        {
          $group: { _id: "$name", avg: { $avg:"$scores.score"} }
        }
      ]
    );
  } catch (err) {
    console.error(err)
  }
}
//- Delete all students that have homework score <= 60
async function example15() {
  try {
    const result=await studentCollection.deleteMany( {$and:[{"scores.type":"homework"},{"scores.score":{ $lte: 60 }}]});
  } catch (err) {
    console.error(err)
  }
}
//- Mark students that have quiz score => 80
async function example16() {
  try {
    const result=await studentCollection.updateMany( {"scores":[{"type":"quiz","score":{$gte:80}}]},{$set:{"mark":"niceQuiz"}});
  } catch (err) {
    console.error(err)
  }
}
/*
  - Write a query that group students by 3 categories (calculate the average grade for three subjects)
  - a => (between 0 and 40)
  - b => (between 40 and 60)
  - c => (between 60 and 100)
*/
async function example17() {
  try {
    const result=await studentCollection.aggregate(
      [
        {
          $group: { _id: "$name", avg: { $avg:"$scores.score"} }
        },
        {
          $cond:{if:{$and:[{$gte:["avg",0]},{$lte:["avg",40]}]},then:{$set:{"group":"a"}}}
        },
        {
          $cond:{if:{$and:[{$gte:["avg",41]},{$lte:["avg",60]}]},then:{$set:{"group":"b"}}}
        },
        {
          $cond:{if:{$and:[{$gte:["avg",61]},{$lte:["avg",100]}]},then:{$set:{"group":"c"}}}
        }
      ]
    );
    console.log("last:"+result);
  } catch (err) {
    console.error(err)
  }
}
