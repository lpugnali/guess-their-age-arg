import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import SPARQLQueryDispatcher from './Service.js';
import './App.css';


function App() {
  
  const initialState = {
    name: "",
    image: "",
    nacimiento: "",
    age: 0,
    realAge: null,
    first:true
  };
  const [person, setPerson] = useState(initialState);
  const initialLoad = ()=>{
    setPerson(initialState);
    const endpointUrl = 'https://query.wikidata.org/sparql';
    const sparqlQuery = `SELECT ?item ?itemLabel ?DR ?image ?RIP
    WHERE 
    {
      ?item wdt:P27 wd:Q414.
      ?item wdt:P569 ?DR . # P569 : Date of birth
      ?item wdt:P18 ?image .
      OPTIONAL{?item wdt:P570 ?RIP .}     # P570 : Date of death
      SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
    }
    limit 10000`;
    
    const queryDispatcher = new SPARQLQueryDispatcher(endpointUrl);
    queryDispatcher.query(sparqlQuery).then((res) =>{
      var ripped = res.results.bindings.filter(x => x.RIP == null);
      console.dir(ripped);
      var rnd = ripped[Math.floor(Math.random() * ripped.length)];
      debugger;
      setPerson({
        name: rnd.itemLabel.value,
        nacimiento: rnd.DR.value,
        image: rnd.image.value});
      console.dir(rnd);
    });
    
  };
  
  const getAge = (dateString) => {
      var today = new Date();
      var birthDate = new Date(dateString);
      var age = today.getFullYear() - birthDate.getFullYear();
      var m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
  }

  const loadItem = () => {
    setPerson({...person,first:false});
    initialLoad();
  }

  const handleChange = (e) => {
    setPerson({...person,age: e.target.value});
  }

  const validate = () => {
    setPerson({ ...person, realAge: getAge(new Date(person.nacimiento))})
  }

  return (
    <div className="App">
      <div>
        <div style={{width:'100%'}}>
        <button style={{ display: (person.first) ? "inline" : "none" }} onClick={loadItem}>{`Play`}</button>
        <img style={{width:'100%'}} src={person.image} alt=""/>
        </div>
        <div style={{width: '100%',
    position: 'fixed',
    float: 'left',
    backgroundColor: '#8080806b',
    bottom: '0',
    padding: '10px',
          display: (person.name == "") ? "none" : "block"}}>
        <button style={{display: (person.name == "" && person.realAge == null) || person.realAge != null  ? "inline" : "none"}} onClick={loadItem}>Play Again</button>
        <h3>{person.name}</h3>
        <input type="number" value={person.age} onChange={handleChange}/>
        <button style={{display: person.realAge == null ? "inline" : "none"}} onClick={validate}>Try</button>
        <h2 style={{display: person.realAge == null?"none" : "block"}}>{person.realAge == person.age ? "CORRECT" : `INCORRECT, he/she is ${person.realAge}`}</h2>
      </div>
      </div>
    </div>
  );
}

export default App;
