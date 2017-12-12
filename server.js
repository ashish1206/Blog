var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool= require('pg').Pool;
var crypto=require('crypto');
var bodyParser=require('body-parser');
var session=require('express-session');
var step=require('step');

var config={
    user:'ashishchauhan1206',
    database:'ashishchauhan1206',
    host:'db.imad.hasura-app.io',
    port:'5432',
    password:'db-ashishchauhan1206-18501'
    
};
var app = express();
app.use(bodyParser.json());
app.use(session({
  secret:'ThisIsRandomeSecretValue',
  cookie:{maxAge:1000*60*60*24*30}
}));
app.use(morgan('combined'));
var pool = new Pool(config);

function hash(input,salt){
    var hashed=crypto.pbkdf2Sync(input,salt,10000,512,'sha512');
    return ["pbkdf2Sync","10000",salt,hashed.toString('hex')].join('$');
}

app.post('/signup',function(req,res){
    var username=req.body.username;
    var password=req.body.password;
    var salt=crypto.randomBytes(128).toString('hex');
    var dbstring=hash(password,salt);
    pool.query('INSERT INTO "user" (username,password) VALUES ($1,$2)',[username,dbstring],function(err,result){
        if(err)
            res.status(500).send(err.toString());
        else
          res.send('user created');
    });
});

app.post('/login',function(req,res){
    var username=req.body.username;
    var password=req.body.password;
    pool.query('SELECT * FROM "user" WHERE username=$1',[username],function(err,result){
       if(err){
           res.status(500).send(toString());
       }else
       if(result.rows.length===0){
           res.send(403).send("username/password is invalid");
       }else{
           var dbstring=result.rows[0].password;
           var salt=dbstring.split('$')[2];
           var hashedpassword=hash(password,salt);
           if(hashedpassword===dbstring){
            req.session.auth={userId:result.rows[0].user_id};
           res.send("logged in");}
           else
           res.send(403).send("username/password is invalid");
       } 
    });
});

app.get('/check',function(req,res){
  if(req.session&&req.session.auth&&req.session.auth.userId){
       pool.query('SELECT * FROM "user" WHERE user_id = $1', [req.session.auth.userId], function (err, result) {
       if (err) {
          res.status(500).send(err.toString());
       } else {
          res.send(result.rows[0].username);    
       }
     });
   } 
   else {
      res.status(400).send('You are not logged in');
  }
});

app.get('/checkid',function(req,res){
  if(req.session&&req.session.auth&&req.session.auth.userId){
       // pool.query('SELECT * FROM "user" WHERE user_id = $1', [req.session.auth.userId], function (err, result) {
       // if (err) {
       //    res.status(500).send(err.toString());
       // } else {
          res.send(req.session.auth.userId.toString());    
     //   }
     // });
    } 
   else {
      res.status(400).send('You are not logged in');
  }
});

app.get('/logout', function (req, res) {
  delete req.session.auth;
  //res.send('<html><body>Logged out!<br/><br/><a href="/">Back to home</a></body></html>');
  res.sendFile(path.join(__dirname, 'files', 'logout.html'));
});

function like(article_id,user_id){
  var status;
  pool.query('SELECT * FROM likes WHERE article_id=$1 AND user_id=$2',[article_id,user_id], function (err, result) {
     if (err) {
        res.status(500).send(err.toString());
     } else {
            if (result.rows.length === 0) {
              status=`like`;
            } else {
              status=`unlike`;
            }  

      }
   });
    return status;
}

function createTemplate (data,user_id) {
    var article_id=data.article_id;
    var heading = data.heading;
    var content = data.content;
    var author = data.author;
    var date = data.date;
    var htmlTemplate = `
        writen by:<p>${author}</p>
        date:<p>${date}</p>
        <h3>
          ${heading}
        </h3>
        <div>
          ${content}
        </div>
        <br>
        <button type="button" class="btn btn-default" id="lb_${article_id}" onclick="
          var article_id='${article_id}';
          var status=document.getElementById('lb_'+article_id).innerHTML;
          var user_id=document.getElementById('user').innerHTML;
          var request = new XMLHttpRequest();
            request.onreadystatechange = function () {
                if (request.readyState ==4) {
                    if (request.status == 200) {
                        
                    } else {
                        
                    }
                }
            };
            request.open('POST','/like_unlike', true);
            request.setRequestHeader('Content-Type','application/json');
            request.send(JSON.stringify({status:status,user_id:user_id,article_id:article_id}));
        ">`;
      //var status=like(article_id,user_id);
    return htmlTemplate;//+status;
}

function comment_section(article_id){
  var comment=`
  <div>
    <input type="text" id="t_${article_id}" >
    <button type="button" class="btn btn-default" onclick="
        var article_id='${article_id}';
        var comment=document.getElementById('t_'+article_id).value;
        var user_id=document.getElementById('user').innerHTML;
        var request = new XMLHttpRequest();
            request.onreadystatechange = function () {
                if (request.readyState ==4) {
                    if (request.status == 200) {
                        comment.innerHTML='';
                    } else {
                        alert('kya hua');
                    }
                }
            };
        request.open('POST','/article_comment', true);
        request.setRequestHeader('Content-Type','application/json');
        request.send(JSON.stringify({comment:comment,user_id:user_id,article_id:article_id})); 
    ">comment</button>
    <div id="div_${article_id}"><textarea id='txa_${article_id}' rows='5' columns='20' readonly></textArea></div>
    <button type="button" class="btn btn-default" onclick="
        var article_id='${article_id}';
        var request = new XMLHttpRequest();
            request.onreadystatechange = function () {
                if (request.readyState ==4) {
                    if (request.status == 200) {
                        document.getElementById('txa_${article_id}').innerHTML=request.responseText;
                    } else {
                        alert('kya hua comment ko');
                    }
                }
            };
        request.open('POST','/read_comment', true);
        request.setRequestHeader('Content-Type','application/json');
        request.send(JSON.stringify({article_id:article_id}));
    ">read comments</button>
  </div>
  `;
  return comment;
}

app.post('/read_comment',function(req,res){
    var article_id=req.body.article_id;
      pool.query('SELECT * FROM comment WHERE article_id=$1 ',[article_id], function (err, result) {
       if (err) {
          res.status(500).send(err.toString());
       } else {
          var middle='';
          numRows=result.rows.length;
          for(var i=numRows-1;i>=0;i-=1){
            middle+=result.rows[i].user_id.toString()+':-'+result.rows[i].comment+'\n';
        }
        res.send(middle);
     }
   });
});

app.post('/article_comment',function(req,res){
    var comment=req.body.comment;
    var user_id=req.body.user_id;
    var article_id=req.body.article_id;
      pool.query('INSERT INTO comment (article_id,user_id,comment) VALUES ($1,$2,$3)',[article_id,user_id,comment], function (err, result) {
       if (err) {
          res.status(500).send(err.toString());
       } else {
          res.send('article commented');
        }
     });
});

app.post('/like_unlike',function(req,res){
    var status=req.body.status;
    var user_id=req.body.user_id;
    var article_id=req.body.article_id;
    if(status=='like'){
      pool.query('INSERT INTO likes (article_id,user_id) VALUES ($1,$2)',[article_id,user_id], function (err, result) {
       if (err) {
          res.status(500).send(err.toString());
       } else {
          res.send('article liked');
        }
     });
    }
    else{
      pool.query('DELETE FROM likes WHERE article_id = $1 AND user_id = $2',[article_id,user_id], function (err, result){
          if (err) {
          res.status(500).send(err.toString());
       } else {
          res.send('article unliked');
        }
      });
    }
});

app.get('/article', function (req, res) {
        pool.query("SELECT * FROM article",function (err, result) {
        if (err) {
            res.status(500).send(err.toString());
        } else {
            if (result.rows.length === 0) {
                res.status(404).send('Article not found');
            } else {
                var middle='';
                numRows=result.rows.length;
                for(var i=numRows-1;i>=0;i-=1){
                    var articleData = result.rows[i];
                    middle=middle +  createTemplate(articleData);
                     var r=like(result.rows[i].article_id,req.session.auth.userId.toString());
                     middle+=r;
                     console.log(r+'button ke bad');
                      middle+= `</button>`;
                      middle+=comment_section(result.rows[i].article_id.toString())+`<hr><hr>`;
                }
                res.send(middle);console.log('bye middle');
            }
        }
      });
});

app.get('/articles', function (req, res) {
  res.sendFile(path.join(__dirname, 'files', 'articles.html'));
});

app.post('/sub_article',function(req,res){
    var author=req.body.author;
    var heading=req.body.heading;
    var content=req.body.content;
    var date=req.body.date;
    pool.query('INSERT INTO article (heading,author,date,content) VALUES ($1,$2,$3,$4)',[heading,author,date,content],function(err,result){
        if(err)
            res.status(500).send(err.toString());
        else
          res.send('article added');
    });
});

var newm = '';
app.post('/newvalue',function(req,res){
  newm=req.body.username +' : '+ req.body.newmsg+'  @'+req.body.date;
  res.send(newm);
});

app.get('/message',function(req,res){
  res.send(newm);
});

var u='';
app.post('/who',function(req,res){
  var u1=req.body.username;
  var v=req.body.v;
  if(v==='y'){
    u=u1;
    res.send(u+' is typing....');
  }
  else
    if(v==='n'){
    if(u==u1)
      u='';
    res.send('');
  }
});

app.get('/whois',function(req,res){
  if(u==''){
    res.send('');
  }
  else{
    res.send(u+' is typing....');
  }
});

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'files', 'index.html'));
});

app.get('/files/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'files', 'style.css'));
});

app.get('/files/main.js', function (req, res) {
  res.sendFile(path.join(__dirname, 'files', 'main.js'));
});

app.get('/files/articles_main.js', function (req, res) {
  res.sendFile(path.join(__dirname, 'files', 'articles_main.js'));
});

app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});
