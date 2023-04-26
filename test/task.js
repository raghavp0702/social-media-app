const chai = require("chai");
const mocha = require("mocha");
const chaiHttp = require("chai-http");
const server = require("../server");

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

let postID ="64482124e2946e4e1a41020e";
let userID = "644773e68f1329adebbf10c5"
let token;

describe("Tests API", () => {
  it("should successfully authenticate a user", (done) => {
    chai
      .request(server)
      .post("/api/authenticate")
      .send(defaultUser)
      .then((err, response) => {
        token = response.body.token;
        response.should.have.status(200);
        response.body.should.have.property("token");
        // done();
      })
      .catch(done());
  });

  it("should not authenticate a user without email", (done) => {
    chai
      .request(server)
      .post("/api/authenticate")
      .send({ password: 1234567 })
      .then((err, response) => {
        response.should.have.status(401);
        // done();
      })
      .catch(done());
  });

  it("should successfully respond with a user profile", (done) => {
    chai
      .request(server)
      .get("/api/user")
      .set({Authorization:`${token}`})
      .then((err, response) => {
        response.should.have.status(200);
        response.should.be.a("object");
        response.should.have.property("name");
        response.should.have.property("followers");
        response.should.have.property("followings");
      })
      .catch(done());
  });

  it("should successfully create a new post",(done)=>{
    chai.request(server)
    .post("/api/posts")
    .set({Authorization:`${token}`})
    .send(defaultPost)
    .then((err,response)=>{
        response.should.have.status(200);
        response.should.be.a("object");
        response.should.have.property("_id");

        response.should.have.property("title");
        response.should.have.property("description");
        response.should.have.property("created");
    }).catch(done());
  })


  it("should not create a new post with a title field missing",(done)=>{
    chai.request(server)
    .post("/api/posts")
    .set({Authorization:`${token}`})
    .send({description:"This is a test description"})
    .then((err,response)=>{
        response.should.have.status(404);
    }).catch(done());
  })

  it("should successfully like a post",(done)=>{
    chai.request(server)
    .post("/api/like/" + postID)
    .set({Authorization:`${token}`})
    .send(defaultPost)
    .then((err,response)=>{
        response.should.have.status(200);
    }).catch(done());
  })

  it("should successfully unlike a post",(done)=>{
    chai.request(server)
    .post("/api/unlike/" + postID)
    .set({Authorization:`${token}`})
    .send(defaultPost)
    .then((err,response)=>{
        response.should.have.status(200);
    }).catch(done());
  })

  it("should successfully follow a user",(done)=>{
    chai.request(server)
    .post("/api/follow/" + userID)
    .set({Authorization:`${token}`})
    .send(defaultPost)
    .then((err,response)=>{
        response.should.have.status(200);
    }).catch(done());
  })

  it("should successfully add a comment to a post",(done)=>{
    chai.request(server)
    .post("/api/comment/" + postID)
    .set({Authorization:`${token}`})
    .send(defaultPost)
    .then((err,response)=>{
        response.should.have.status(200);
        response.should.be.a("object");
        response.should.have.property("_id");
    }).catch(done());
  })

  it("should successfully getting a single post and its associated number of likes and comments",(done)=>{
    chai.request(server)
    .post("/api/posts" + postID)
    .set({Authorization:`${token}`})
    .send(defaultPost)
    .then((err,response)=>{
        response.should.have.status(200);
        response.should.be.a("object");
        
        response.should.have.property("title");
        response.should.have.property("description");
        response.should.have.property("author");
        response.should.have.property("created");
        response.should.have.property("numberOfLikes");
        response.should.have.property("numberOfComments");
    }).catch(done());
  })

  it("should successfully getting all posts created by an authenticated user",(done)=>{
    chai.request(server)
    .post("/api/all_posts")
    .set({Authorization:`${token}`})
    .send(defaultPost)
    .then((err,response)=>{
        response.should.have.status(200);
        response.should.be.a("array");
        
        response.should.have.property("_id");
        response.should.have.property("title");
        response.should.have.property("description");
        response.should.have.property("created");
        response.should.have.property("likes");
        response.should.have.property("comments");
    }).catch(done());
  })

});
