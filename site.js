"use strict";
(function(){
  const form=document.getElementById("project-form");
  const choice=document.getElementById("service");
  const details=document.getElementById("details");
  const client=document.getElementById("client");
  const error=document.getElementById("form-error");
  const mobile=document.querySelector(".mobile-nav");
  document.querySelectorAll("[data-service-link]").forEach(function(link){
    link.addEventListener("click",function(){
      if(choice){choice.value=link.getAttribute("data-service-link")||""}
    });
  });
  if(mobile){mobile.querySelectorAll("nav a").forEach(function(link){link.addEventListener("click",function(){mobile.removeAttribute("open")})})}
  if(!form||!choice||!details||!error){return}
  form.addEventListener("submit",function(event){
    event.preventDefault();
    const service=choice.value.trim(),description=details.value.trim(),name=client.value.trim();
    if(!service){error.textContent="Please choose what you need help with.";choice.focus();return}
    if(description.length<10){error.textContent="Please tell us a little more (at least 10 characters).";details.focus();return}
    error.textContent="";
    const parts=["Hello ArnovaGroup, I'd like to ask about a service.","Service: "+service];
    if(name){parts.push("Name or business: "+name)}
    parts.push("My request: "+description);
    parts.push("Please let me know what the next steps could be.");
    const url="https://wa.me/250794607518?text="+encodeURIComponent(parts.join("\n"));
    window.location.assign(url);
  });
})();