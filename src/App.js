import React, { Component } from 'react';
import Chat from './chat.json';
import * as d3 from 'd3';
import population from './population.csv';
import { CSSTransitionGroup } from 'react-transition-group' // ES6
//import ReactCSSTransitionGroup from 'react-addons-css-transition-group'; // ES6
//import data2 from './data';
//import SpeechRecognition from 'react-speech-recognition';
//import { ReactMic } from 'react-mic';
//import AudioRecorder from 'react-audio-recorder';

class App extends Component {
  constructor(props) {
  super(props);
  this.state = {
  input:'',
  chat:Chat,
  count:3,
  record: false,
  audio:[],
  active:true
  };
}
 
  componentDidMount(){
        this.draw();
  }

  draw(){

   var margin = {top: 20, right: 40, bottom: 30, left: 20},
   width = 960 - margin.left - margin.right,
   height = 500 - margin.top - margin.bottom,
   barWidth = Math.floor(width / 19) - 1;

var x = d3.scaleLinear()
   .range([barWidth / 2, width - barWidth / 2]);

var y = d3.scaleLinear()
   .range([height, 0]);

var yAxis = d3.axisLeft()
   .scale(y)
   .tickSize(-width)
   .tickFormat(function(d) { return Math.round(d / 1e6) + "M"; });

// An SVG element with a bottom-right origin.
var svg = d3.select(".ct-chart").append("svg")
   .attr("width", width + margin.left + margin.right+50)
   .attr("height", height + margin.top + margin.bottom+50)
 .append("g")
   .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// A sliding container to hold the bars by birthyear.
var birthyears = svg.append("g")
   .attr("class", "birthyears");

// A label for the current year.
var title = svg.append("text")
   .attr("class", "title")
   .attr("dy", ".71em")
   .text(2000);

d3.csv(population)
  .then(function(data) {

     // Convert strings to numbers.
data.forEach(function(d) {

   d.people = +d.people;
   d.year = +d.year;
   d.age = +d.age;

 //  console.log(d);
 });


 // Compute the extent of the data set in age and years.
 var age1 = d3.max(data, function(d) { return d.age; }),
     year0 = d3.min(data, function(d) { return d.year; }),
     year1 = d3.max(data, function(d) { return d.year; }),
     year = year1;

 // Update the scale domains.
 x.domain([year1 - age1, year1]);
 y.domain([0, d3.max(data, function(d) { return d.people; })]);


 // Produce a map from year and birthyear to [male, female].
 data = d3.nest()
     .key(function(d) { return d.year; })
     .key(function(d) { return d.year - d.age; })
      .rollup(function(v) { return v.map(function(d) { return d.people; }); })
      .map(data);

  // Add an axis to show the population values.
  svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + width + ",0)")
      .call(yAxis)
    .selectAll("g")
    .filter(function(value) { return !value; })
      .classed("zero", true);

  // Add labeled rects for each birthyear (so that no enter or exit is required).
  var birthyear = birthyears.selectAll(".birthyear")
      .data(d3.range(year0 - age1, year1 + 1, 5))
      .enter().append("g")
      .attr("class", "birthyear")
      .attr("transform", function(birthyear) { return "translate(" + x(birthyear) + ",0)"; });


  birthyear.selectAll("rect")
      .data(function(birthyear) {return data.get(year).get(birthyear) || [0, 0]; })
      .enter().append("rect")
      .attr("x", -barWidth / 2) 
      .attr("width", barWidth) //size single piece graph
      .attr("y", y)
      .attr("height", function(value) { return height - y(value)-50; });

  // Add labels to show birthyear.
  birthyear.append("text")
      .attr("y", height - 4)
      .text(function(birthyear) { return birthyear; });

  // Add labels to show age (separate; not animated).
       svg.selectAll(".age")
      .data(d3.range(0, age1 + 1, 5))
      .enter().append("text")
      .attr("class", "age")
      .attr("x", function(age) { return x(year - age); })
      .attr("y", height + 4) //modified -20
      .attr("dy", ".71em")
      .text(function(age) { return age; });

  // Allow the arrow keys to change the displayed year.


  window.focus();
  d3.select(window).on("keydown", function() {
  //  console.log(d3.event.keyCode);
    switch (d3.event.keyCode) {
      case 37: year = Math.max(year0, year - 10); break;
      case 39: year = Math.min(year1, year + 10); break;
    }
    update();
  });


  function update() {
  //console.log(year);
    title.text(year);
//if (!(year in data)) return;
    birthyears.transition()
        .duration(750)
        .attr("transform", "translate(" + (x(year1) - x(year)) + ",0)");
//console.log(data.get(year).get(birthyear));
    birthyear.selectAll("rect")
        .data(function(birthyear) { return data.get(year).get(birthyear) || [0, 0]; })
        .transition()
        .duration(750)
        .attr("y", y)
        .attr("height", function(value) { return height - y(value); });
  }
});

        }

handleOnClick(){
  this.setState({active:!this.state.active}); 
}

  handleClick(event) {
  let newObj= [...this.state.chat];
  let current_time = new Date(); // for now
  let time=current_time.getHours()+":"+(current_time.getMinutes()<10?'0':'')+current_time.getMinutes();

  /*when the message is not only spaces*/
  newObj.unshift({"id":"human","text":this.state.input,"time":time});
  this.setState({chat: newObj});  
  //console.log(n);
  //console.log(this.state.input);  
  //console.log(newObj);
  if (this.state.input.replace(/\s+/, "") == "") {
  newObj.unshift({"id":"bot","text":"I'm afraid I didn't understand, could you try again, please?","time":time});
  this.setState({chat: newObj});   
}

  if (this.state.input.replace(/[$-/:-?{-~!"^_`\\]+/, "") === "") {
  newObj.unshift({"id":"bot","text":"I'm afraid I didn't understand, could you try again, please?","time":time});
  this.setState({chat: newObj});   
}

if(this.state.input==="Hi"){
 newObj.unshift({"id":"bot","text":"Hi there!","time":time});
  this.setState({chat: newObj});    
}

if(this.state.input==="How are you?"){
 newObj.unshift({"id":"bot","text":"I am fine.","time":time});
  this.setState({chat: newObj});    
}

if(this.state.input==="What are you doing?"){
 newObj.unshift({"id":"bot","text":"Nothing.","time":time});
  this.setState({chat: newObj});    
}

if(this.state.input==="What can you do?"){
 newObj.unshift({"id":"bot","text":"Nothing.","time":time});
  this.setState({chat: newObj});    
}

if(this.state.input==="Who are you?"){
 newObj.unshift({"id":"bot","text":"Not sure I can answer this question.","time":time});
  this.setState({chat: newObj});    
}



this.setState({ input: '' });  
/*  newObj.push({"id"false:"human","text":event.target.value});
  console.log(JSON.stringify(newObj));
*/
}

/*Microphone Handle Click*/
handleClickM(event) {
  this.setState({record:!this.state.record});   

    if(!this.state.record){
    if(this.state.active){     
  this.setState({active:!this.state.active});   

    }
    }

/*  if(this.state.record){
    if(!this.state.active){
  this.setState({active:!this.state.active});   
    }
    }
*/
  
  navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = e => {
  
      let audioChunks=[...this.state.audio];
      audioChunks.push(e.data);
      console.log(e.data);
      this.setState({ audio: audioChunks }); 
      if (mediaRecorder.state == "inactive"){
      let blob = new Blob(audioChunks,{type:'audio/x-mpeg-3'});
      this.state.record?mediaRecorder.start():mediaRecorder.stop();
  }}});
 


//console.log("hey");
}

handleChange(event) {
this.setState({ input: event.target.value });
}

_handleKeyPress = (e) => {
    if (e.key === 'Enter') {
this.handleClick()
    }
  }

  render() {
     
let items=Object.keys(this.state.chat).map((key, i) => {
  let key_each=this.state.chat[key].text+this.state.chat[key].time;
//  console.log(key_each);
  return ( 
    <div key={key_each}>
    {this.state.chat[key].id==="human"? 
    (<div>
  <div className="clear"></div>
    <div className="from-me">
      <p>{this.state.chat[key].text}<span className="time-right-a">{this.state.chat[key].time}</span></p>
    </div>
    </div>):
    (<div key={key_each}>
    <div className="from-them">
      <p>{this.state.chat[key].text}<span className="time-right">{this.state.chat[key].time}</span></p>
    </div>
    </div>)} 
    </div>
    );
});

    return (

      <div className="wrapper">
        {/* Page Content Holder */}
        <div id="content">
      <br /> <div className="line-through"> 

  <button className={this.state.record?"pulse-button toggle":"pulse-button"} onClick={this.handleClickM.bind(this)}>
    <i className="fas fa-microphone"></i> 
  </button>
</div>
<br/>
     <div className="wrapper">
              <div className="ct-chart ct-golden-section">
  
   <svg width="920" height="500" style={{border:'solid 1px #eee',borderBottom:'solid 1px #ccc'}}  viewBox="0 0 960 500" preserveAspectRatio="xMidYMid meet"/>

              </div> 
            </div> 

            <nav className="navbar">
            <div className="container-fluid">
              <div className="navbar-header">
                <button type="button" id="sidebarCollapse" className="btn btn-info navbar-btn" onClick={this.handleOnClick.bind(this)}>
                  <i className="glyphicon glyphicon-align-left a" />
                  <span></span>
                </button>
              </div>
              <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
              </div>
            </div>
          </nav>
        </div>
        {/* Sidebar Holder */}
        <nav id="sidebar" className={this.state.active?"active":""}>
                <div className="w-live-chat">
          <span className="live-chat">Live chat </span>
            <br /><br />
          {/*this.state.input*/}


                    <div className="input-button">
              <input type="text" className="input-padding" value={this.state.input} onChange={this.handleChange.bind(this)} onKeyPress={this._handleKeyPress}/>
          
<a className="button orange" href="#" onClick={this.handleClick.bind(this)}>
Send</a>

            </div>
            <br />
          
 
     <section>

{/*when a new item is entered new-message toggle animation*/}


 <CSSTransitionGroup transitionName={{enter: 'new-message'}}>
          {items}
        </CSSTransitionGroup>

{/*<ReactCSSTransitionGroup transitionName={{enter: 'new-message'}}  transitionEnterTimeout={1000}>
  {items}
</ReactCSSTransitionGroup>*/}

      </section>          
          


          </div>
        </nav>
      </div>


    );
  }
}

export default App;
