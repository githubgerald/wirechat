// GET request the chatlog
async function GETchatlog(url) {  // url to be changed out later
  const response = await fetch("http://localhost:5000/api/v0/chats/1234");
  let chatlog = await response.json();  // grabs the chatlog
  // console.log(chatlog);  // can be removed once done testing

  let i = 0;
  while (i != chatlog.messages.length) {
    // write whatever you want to happen to the singular message here





    console.log(chatlog.messages[i]);
    i++;
  }
}
