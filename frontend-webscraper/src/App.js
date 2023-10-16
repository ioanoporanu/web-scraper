import './App.css';
import { Input } from "@material-tailwind/react";
import axios from "axios";
import React from "react";

function App() {
    const [post, setPost] = React.useState();

    const [message, setMessage] = React.useState('');

    const [updated, setUpdated] = React.useState('');

    const handleChange = (event) => {
        setMessage(event.target.value);
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
                axios.get('http://localhost:8080/',  {
                    params: {link: message},
                }).then((response) => {
                    setPost(response.data);
                });
            setUpdated(message);
        }
    };

    return (
    <div className="App">
      <header className="App-header">
        Web Scraper
      </header>
       <body className="App-body">
        <div className="flex w-72 flex-col gap-6" style={{justifyContent: "center"}}>
            <svg className="h-8 w-8 text-red-500" width="24" height="24" viewBox="0 0 24 24" stroke-width="2"
                 stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z"/>
                <circle cx="10" cy="10" r="7"/>
                <line x1="21" y1="21" x2="15" y2="15"/>
            </svg>
           <Input
               placeholder="insert website"
                  name="message"
                  value={message}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}/>
        </div>
        <div className= "Display-Box">
           <pre>{JSON.stringify(post, null, 2) }</pre>
        </div>
       </body>
    </div>
    );
}

export default App;
