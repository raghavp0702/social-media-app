const chai = require("chai");
const mocha = require("mocha");
const chaiHttp = require("chai-http");
const server = "http://localhost:5000";
// const request = require("request");

const jsonpath = require("jsonpath");

chai.should();

chai.use(chaiHttp);

let defaultUser = {
  email: "user1@gmail.com",
  password: "1234567",
};

let defaultPost = {
  title: "Test Post",
  description: "This is a test post",
};
let defaultComment = {
  comment: "Test Comment"
};

let postID = "64482124e2946e4e1a41020e";
let userID = "644773e68f1329adebbf10c5";
let token;

describe("Tests API", () => {
  it("should successfully authenticate a user", async function () {
    let res = await chai
      .request("https://social-media-api-5f39.onrender.com")
      .post("/api/authenticate")
      .send(defaultUser)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");

      token = res.body.token;
      console.log(token);
    res.should.have.status(200);
    res.body.should.have.property("token");
    // .get('/')

    // done();
    // })
  });

  it("should not authenticate a user without email", async function () {
    let res = await chai
      .request("https://social-media-api-5f39.onrender.com")
      .post("/api/authenticate")
      .send({ password: 1234567 })
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");
    res.should.have.status(401);
    // done();
  });

  it("should successfully respond with a user profile", async function () {
    let res = await chai
      .request("https://social-media-api-5f39.onrender.com")
      .get("/api/user")
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set({ Authorization: `${token}` });

    res.should.have.status(200);
    res.should.be.a("object");
    res.body.should.have.property("name");
    res.body.should.have.property("followers");
    res.body.should.have.property("following");
  });

  it("should successfully create a new post", async function () {
    let res = await chai
      .request("https://social-media-api-5f39.onrender.com")
      .post("/api/posts")
      .send(defaultPost)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set({Authorization: `${token}` });

    // console.log(res.body);
    res.should.have.status(200);
    res.should.be.a("object");
    res.body.should.have.property("postID");
    res.body.should.have.property("title");
    res.body.should.have.property("description");
    res.body.should.have.property("created");
  });

  
  it("should successfully delete a new post", async function () {
    let res = await chai
      .request("https://social-media-api-5f39.onrender.com")
      .delete("/api/posts")
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set({Authorization: `${token}` });

    // console.log(res.body);
    res.should.have.status(200);
    // res.should.be.a("object");
    // res.body.should.have.property("postID");
    // res.body.should.have.property("title");
    // res.body.should.have.property("description");
    // res.body.should.have.property("created");
  });

  it("should not create a new post with a title field missing",async function () {
    let res = await chai
      .request("https://social-media-api-5f39.onrender.com")
    .post("/api/posts")
    .send({description:"This is a test description"})
    .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    .set({Authorization:`${token}`})
    
        res.should.have.status(404);
  })

  it("should successfully like a post",async function () {
    let res = await chai
      .request("https://social-media-api-5f39.onrender.com")
    .post("/api/like/" + postID)
    // .send(defaultPost)
    .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    .set({Authorization:`${token}`})

        res.should.have.status(200);

  })

  it("should successfully unlike a post",async function () {
    let res = await chai
      .request("https://social-media-api-5f39.onrender.com")
    .post("/api/unlike/" + postID)
    // .send(defaultPost)
    .set({Authorization:`${token}`})
    .set("Content-Type", "application/json")
      .set("Accept", "application/json")

        res.should.have.status(200);

  })

  it("should successfully follow a user",async function () {
    let res = await chai
      .request("https://social-media-api-5f39.onrender.com")
    .post("/api/follow/" + userID)
    .send(defaultPost)
    .set({Authorization:`${token}`})
    
    .set("Content-Type", "application/json")
      .set("Accept", "application/json")
 
        res.should.have.status(200);

  })

  it("should successfully add a comment to a post",async function () {
    let res = await chai
      .request("https://social-media-api-5f39.onrender.com")
    .post("/api/comment/" + postID)
    .send(defaultComment)
    .set("Content-Type", "application/json")
    .set("Accept", "application/json")
    .set({Authorization:`${token}`})
 
        res.should.have.status(200);
        res.should.be.a("object");
        res.body.should.have.property("commentId");

  })

  it("should successfully getting a single post and its associated number of likes and comments",async function () {
    let res = await chai
      .request("https://social-media-api-5f39.onrender.com")
    .get("/api/posts" + postID)
    // .send(defaultPost)
    .set("Content-Type", "application/json")
    .set("Accept", "application/json")
    .set({Authorization:`${token}`})
    res.should.have.status(200);
        res.should.be.a("object");

        res.body.should.have.property("title");
        res.body.should.have.property("description");
        res.body.should.have.property("author");
        res.body.should.have.property("created");
        res.body.should.have.property("numberOfLikes");
        res.body.should.have.property("numberOfComments");

  })

  it("should successfully getting all posts created by an authenticated user",async function () {
    let res = await chai
      .request("https://social-media-api-5f39.onrender.com")
    .get("/api/all_posts")
    // .send(defaultPost)
    .set("Content-Type", "application/json")
    .set("Accept", "application/json")
    .set({Authorization:`${token}`})

        res.should.have.status(200);
        res.should.be.a("array");

        res.body.should.have.property("id");
        res.body.should.have.property("title");
        res.body.should.have.property("description");
        res.body.should.have.property("created");
        res.body.should.have.property("likes");
        res.body.should.have.property("comments");

  })
});
