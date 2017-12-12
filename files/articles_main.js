function checkuserid() {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState ==4) {
            if (request.status == 200) {
                document.getElementById('user_id').innerHTML=request.responseText;
            } else {
                alert("something went wrong ck");
            }
        }
    };
    request.open('GET','/checkid', true);
    request.send(null);
}

function checkuser() {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState ==4) {
            if (request.status == 200) {
                document.getElementById('user').innerHTML=request.responseText;
            } else {
                alert("something went wrong ck");
            }
        }
    };
    request.open('GET','/check', true);
    request.send(null);
}

var load_articles=document.getElementById('load-articles');
var user_id=document.getElementById('user').innerHTML;
function Load_Articles(){
        checkuser();checkuserid();
        var request=new XMLHttpRequest();
        request.onreadystatechange=function(){
            if(request.readyState==4){
                if(request.status==200){
                    load_articles.innerHTML+=request.responseText;
                }
                else
                if(request.status==500)
                    alert('something went wrong la');
            }
        };
        request.open('GET','/article',false);
        request.send(null);
}

var submit_article=document.getElementById('submit_article');
submit_article.onclick=function(){
    var request=new XMLHttpRequest();
    var heading=document.getElementById('heading').value;
    var content=document.getElementById('content').value;
    var author=document.getElementById('user').innerHTML;
    var date = new Date();
        date = date.getFullYear() + "-" + ('0' + (date.getMonth() + 1)).slice(-2) + "-" + ('0' + date.getDate()).slice(-2) + " " + ('0' + date.getHours()).slice(-2) + ":" + ('0' + date.getMinutes()).slice(-2) + ":" + ('0' + date.getSeconds()).slice(-2);
    request.onreadystatechange=function(){
            if(request.readyState==4){
                if(request.status==200){
                    alert('done');
                }
                else
                if(request.status==500)
                    alert(this.responseText);
            }
        };
    request.open('POST','/sub_article',true);
    request.setRequestHeader('Content-Type','application/json');
    request.send(JSON.stringify({author:author,heading:heading,content:content,date:date}));
};

    

Load_Articles();
