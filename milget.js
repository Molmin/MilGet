function $(x){
	return document.getElementById(x);
}
function isnumber(x){
	return (/(^[1-9]\d*$)/.test(x));
}
function getvalue(key){
	if(window.localStorage)
		return window.localStorage.getItem(key);
	return null;
}
function setvalue(key,val){
	if(window.localStorage)
		window.localStorage.setItem(key,val);
}
function getrand(l,r){
	return Math.floor(Math.random()*(r-l))+l;
}
function numberchange(x){
	if(x<10000)return String(x);
	if(x<10000000)return String(Math.floor(x/1000)/10)+"W";
	return String(Math.floor(x/100000)/100)+"kW";
}
function getTextSize(fontSize,text){ 
	var span=document.createElement("span"); 
	var result={};
	result.width=span.offsetWidth; 
	result.height=span.offsetHeight;
	span.style.visibility="hidden";
	span.style.fontSize=fontSize+"px";
	span.style.display="inline-block";
	document.body.appendChild(span);
	if(typeof span.textContent!="undefined")
		span.textContent=text;
	else span.innerText=text;
	result.width=parseFloat(window.getComputedStyle(span).width)-result.width;
	result.height=parseFloat(window.getComputedStyle(span).height)-result.height;
	span.remove();
	return result;
}

var blocksize,mapsize;
function initmainmap(blocksize,mapsize){
	var s="";
	for(var i=0;i<mapsize;i++){
		s=s+'<div style="position: absolute; top: '+String((blocksize+3)*i)+'px;">';
		for(var j=0;j<mapsize;j++){
			s=s +'<div '
				+'id="block-'+String(i)+'-'+String(j)+'" '
				+'class="map-block" '
				+'style="position: absolute; left: '+String((blocksize+3)*j)+'px;" '
				+'onclick="work('+String(i)+','+String(j)+');">'
				+'</div> ';
		}
		s=s+'</div>';
	}
	$("main-map").innerHTML=s;
}
function initdatas(){
	if(getvalue("gm-mg-wavesum")==null)setvalue("gm-mg-wavesum","0");
	if(getvalue("gm-mg-gamesTotal")==null)setvalue("gm-mg-gamesTotal","0");
	if(getvalue("gm-mg-maxScore")==null)setvalue("gm-mg-maxScore","0");
	$("sys-maxscore").innerHTML=getvalue("gm-mg-maxScore");
	if(getvalue("gm-mg-ingame")=="yes")
		setvalue("gm-mg-wavesum",String(Number(getvalue("gm-mg-wavesum"))+Number(getvalue("gm-mg-ingame-wave")))),
		setvalue("gm-mg-gamesTotal",String(Number(getvalue("gm-mg-gamesTotal"))+1)),
		setvalue("gm-mg-ingame","no");
	$("mes-starter-wave").value=Math.floor(Number(getvalue("gm-mg-wavesum"))/Number(getvalue("gm-mg-gamesTotal"))/2.0);
	if($("mes-starter-wave").value=="0"||$("mes-starter-wave").value=="NaN")$("mes-starter-wave").value=1;

}

var opmode=0; // 是否为反向模式
function updopmode(){
	opmode=1-opmode;
	if(opmode==1)$("mes-operationmode").innerHTML="切换为正向模式";
	else $("mes-operationmode").innerHTML="切换为反向模式";
}

var game_score,game_wave,game_blood,game_limit;
function gameend(){
	$("mes-starter-button").innerHTML="开始";
	setvalue("gm-mg-gamesTotal",String(Number(getvalue("gm-mg-gamesTotal"))+1));
	setvalue("gm-mg-wavesum",String(Number(getvalue("gm-mg-wavesum"))+game_wave));
	setvalue("gm-mg-ingame","no");
	if(Number(getvalue("gm-mg-maxScore"))<game_score)
		setvalue("gm-mg-maxScore",String(game_score));
}
function updatesysdata(){
	$("sys-wave").innerHTML=String(game_wave);
	$("sys-score").innerHTML=numberchange(game_score);
	$("sys-blood").innerHTML=numberchange(game_blood);
	$("sys-limit").innerHTML=numberchange(game_limit);
}

var waiting=false;
var itemname=["","雷",""];
var itempic=["","bomb"];
var map; // [格子状态,物品类型,等级]
// 状态：0 隐藏 1 显示 2 打开
function updateblock(x,y){
	// console.log(String(x)+","+String(y)+","+map[x][y].toString());
	if(map[x][y][0]==0)
		$("block-"+String(x)+"-"+String(y)).innerHTML='<img src="image/items/hideblock.png" style="width: 20px; height: 20px;">';
	if(map[x][y][0]==1)
		$("block-"+String(x)+"-"+String(y)).innerHTML='<img src="image/items/'+itempic[map[x][y][1]]+'.png" style="width: 20px; height: 20px;">';
	if(map[x][y][0]==2){
		var total=0;
		if(x>0&&map[x-1][y][1]>0)total++;
		if(y>0&&map[x][y-1][1]>0)total++;
		if(x<mapsize-1&&map[x+1][y][1]>0)total++;
		if(y<mapsize-1&&map[x][y+1][1]>0)total++;
		if(x>0&&y>0&&map[x-1][y-1][1]>0)total++;
		if(x>0&&y<mapsize-1&&map[x-1][y+1][1]>0)total++;
		if(x<mapsize-1&&y>0&&map[x+1][y-1][1]>0)total++;
		if(x<mapsize-1&&y<mapsize-1&&map[x+1][y+1][1]>0)total++;
		$("block-"+String(x)+"-"+String(y)).innerHTML='<img src="image/number/'+String(total)+'.png" style="width: 20px; height: 20px;">';
	}
}
function initmapval(bombcount){
	map=new Array();
	for(var i=0;i<mapsize;i++){
		map[i]=new Array();
		for(var j=0;j<mapsize;j++){
			map[i][j]=new Array();
			for(var k=0;k<3;k++)
				map[i][j][k]=0;
		}
	}
	for(var i=0;i<bombcount;i++){
		var x=getrand(0,mapsize),y=getrand(0,mapsize);
		while(map[x][y][1]==1)x=getrand(0,mapsize),y=getrand(0,mapsize);
		map[x][y][1]=1;
	}
	for(var i=0;i<mapsize;i++)
		for(var j=0;j<mapsize;j++)
			updateblock(i,j);
}

function itemwork(op,x,y,item,lv){
	return "可还行";
}
function work(x,y){
	if(getvalue("gm-mg-ingame")!="yes")return;
	if(map[x][y][0]==2)return;
	if(map[x][y][1]>0){
		var message="触发 “"+itemname[map[x][y][1]]+"”（坐标 "+String(x)+","+String(y)+" 等级 "+String(map[x][y][2])+"）：";
		message=message+itemwork(opmode,x,y,map[x][y][1],map[x][y][2]);
	}
	map[x][y][0]=2;
	map[x][y][1]=0;
	map[x][y][2]=0;
	updateblock(x,y);
}

function gamestart(){
	setvalue("gm-mg-ingame","yes");
	$("mes-starter-button").innerHTML="重新开始";
	game_wave=Number($("mes-starter-wave").value);
	game_score=0;
	game_limit=game_blood=100;
	updatesysdata();
	initmapval(25);
}
function startgame(){
	if(getvalue("gm-mg-ingame")=="yes")
		setvalue("gm-mg-wavesum",String(Number(getvalue("gm-mg-wavesum"))+Number(getvalue("gm-mg-ingame-wave")))),
		setvalue("gm-mg-gamesTotal",String(Number(getvalue("gm-mg-gamesTotal"))+1)),
		setvalue("gm-mg-ingame","no");
	var maxwave=Math.floor(Number(getvalue("gm-mg-wavesum"))/Number(getvalue("gm-mg-gamesTotal"))/2.0);
	if(getvalue("gm-mg-gamesTotal")=="0"||getvalue("gm-mg-wavesum")=="0")maxwave=1;
	var inputwave=$("mes-starter-wave").value;
	if(isnumber(inputwave)&&Number(inputwave)<=maxwave)gamestart();
}

window.onload=function(){
	blocksize=20,mapsize=30;
	initmainmap(blocksize,mapsize);
	initdatas();
}