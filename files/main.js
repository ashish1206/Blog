function LoadLoginForm(){
    var form=`<h3>LOGIN</h3>
            <input type='text' id='username' placeholder='Username'>
            <input type='password' id='password' placeholder='Password'>
            <input type='submit' value='log in' id='loginb'>
            <br>
            <h3>SIGN UP</h3>
            <input type='text' id='s_username' placeholder='Enter Username'>
            <input type='password' id='s_password' placeholder='Enter Password'>
            <input type='submit' value='sign up' id='signupb'>`
    document.getElementById('login_area').innerHTML=form;
    var b_signup=document.getElementById('signupb');
    b_signup.onclick=function(){
        var request=new XMLHttpRequest();
        request.onreadystatechange=function(){
            if(request.readyState==4){
                if(request.status==200)
                    alert('user created');
                else
                    alert('something went wrong');
            }
        };
        var username=document.getElementById('s_username').value;
        var password=document.getElementById('s_password').value;
        request.open('POST','/signup',true);
        request.setRequestHeader('Content-Type','application/json');
        request.send(JSON.stringify({username: username,password: password}));
    };

    var b_login=document.getElementById('loginb');
    b_login.onclick=function(){
        var request=new XMLHttpRequest();
        var username=document.getElementById('username').value;
        var password=document.getElementById('password').value;
        request.onreadystatechange=function(){
            if(request.readyState==4){
                if(request.status==200){
                    alert('logged in!!');
                    LoadLoggedIn(username);
                }
                else
                if(request.status==403)
                    alert('wrong username/password');
                else
                if(request.status==500)
                    alert('something went wrong');
            }
        };
        request.open('POST','/login',true);
        request.setRequestHeader('Content-Type','application/json');
        request.send(JSON.stringify({username: username,password: password}));
    };

}
var c='',co='';
function LoadLoggedIn(username){
var page=`
        <button>
        <a href="/articles">read    
        </button>
        <a href="/logout">logout</a><br/>
        <h4>HI! ${username} Welcome</h4>
        <br/>
        <textarea id="myTextArea" rows="5" columns="20" readonly></textArea>
        <br/>
        <input type="text" id="newmsg"placeholder='Type message'>
        <input type="submit" id="send" value="send">
        <div id="typer"></div>`
        document.getElementById('login_area').innerHTML=page;
        LoadNewMessage(username);
        var send=document.getElementById('send');
        send.onclick=function(){
        var request=new XMLHttpRequest();
        request.onreadystatechange=function(){
            if(request.readyState==4){
                if(request.status==200){
                    LoadNewMessage(username);
                    document.getElementById('newmsg').value="";
                    //c=request.responseText;
                    //var d=document.getElementById('myTextArea').value +'\n'+ c;
                    //document.getElementById('myTextArea').innerText=d;
                }
                else
                    alert('something went wrong');
            }
        };
        var newmsg=document.getElementById('newmsg').value;
        var d = new Date();
        d = d.getFullYear() + "-" + ('0' + (d.getMonth() + 1)).slice(-2) + "-" + ('0' + d.getDate()).slice(-2) + " " + ('0' + d.getHours()).slice(-2) + ":" + ('0' + d.getMinutes()).slice(-2) + ":" + ('0' + d.getSeconds()).slice(-2);
        request.open('POST','/newvalue',true);
        request.setRequestHeader('Content-Type','application/json');
        request.send(JSON.stringify({username:username,newmsg:newmsg,date:d}));
        };


// var read=document.getElementById('article');
//     read.onclick=function(){
//         var request=new XMLHttpRequest();
//         request.onreadystatechange=function(){
//             if(request.readyState==4){
//                 if(request.status==200){
//                     alert('done');
//                 }
//                 else
//                 if(request.status==403)
//                     alert('wrong username/password');
//                 else
//                 if(request.status==500)
//                     alert('something went wrong');
//             }
//         };
//         request.open('GET','/articles',true);
//         request.send(null);
//     };
 }
function LoadNewMessage(username){
    var request=new XMLHttpRequest();
    request.onreadystatechange=function(){
        if(request.readyState==4){
            if(request.status==200){
                c=request.responseText;
                //var d=document.getElementById('myTextArea').value +'\n'+ c;
                if(c!=co)
                document.getElementById('myTextArea').innerText=document.getElementById('myTextArea').value +'\n'+ c;
                document.getElementById("myTextArea").scrollTop = document.getElementById("myTextArea").scrollHeight;
                co=c;
                var typped=document.getElementById('newmsg').value;
                var v='n';
                if(typped!=''){v='y';
                    var reques=new XMLHttpRequest();
                    reques.onreadystatechange=function(){
                        if(reques.readyState==4&&request.status==200){
                            CheckWho();
                            //var t=reques.responseText;
                            //document.getElementById('typer').innerHTML=`<p>${t}</p><br/>`;
                        }

                    };
                    reques.open('POST','/who',true);
                    reques.setRequestHeader('Content-Type','application/json');
                    reques.send(JSON.stringify({username:username,v:v}));
                }
                else{
                    v='n';
                    var reques=new XMLHttpRequest();
                    reques.onreadystatechange=function(){
                        if(reques.readyState==4&&request.status==200){
                            CheckWho();
                            //var t=reques.responseText;
                            //document.getElementById('typer').innerHTML=`<p>${t}</p><br/>`;
                        }

                    };
                    reques.open('POST','/who',true);
                    reques.setRequestHeader('Content-Type','application/json');
                    reques.send(JSON.stringify({username:username,v:v}));
            }
                //setTimeout(LoadNewMessage(username),1000);
            }else{
                alert('Something went wrong!');
            }
        }
    };
    request.open('GET','/message',true);
    request.send(null);
    
}

function LoadLogin() {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState ==4) {
            if (request.status == 200) {
                LoadLoggedIn(this.responseText);
            } else {
                LoadLoginForm();
            }
        }
    };
    
    request.open('GET', '/check', true);
    request.send(null);
}

function CheckWho(){
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState ==4) {
            if (request.status == 200) {
                var t=request.responseText;
                document.getElementById('typer').innerHTML=`<p>${t}</p><br/>`;
            }
        }
    };
    
    request.open('GET', '/whois', true);
    request.send(null);
}
LoadLogin();
