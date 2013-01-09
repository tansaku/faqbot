faqbot
======

JavaScript chat bot to answer frequently asked questions (faq)

----

Most Natural Language Processing (NLP) approaches seem to be focused on how to parse sentences - not on how to construct sentences that match some model of the world

Most Chatbots seem designed to have a fixed database of material, although some do learn and remember word occurrence probabilities 

There appears to be an interesting intersection for a chatbot that made additional use of NLP techniques and a good persistence framework.

This project is aiming to create a chatbot that can have a knowledge base updated by individual users through a process of discussion, e.g.  

Human: There is a game engine Unreal Engine  
Bot: OK  
Human: What is Unreal Engine?  
Bot: Unreal Engine is a game engine

Ideally all conversations will be stored in the cloud.  In the first instance Github Gists seem like a good idea.  An authenticated Github user could have gists created associated with their own user account.  Although ideally the chatbot won't be tied to a particular persistence framework.

This kind of system could have great applicaton for online classes.  It would be great if the faqbots knowledge base could contain all the data related to an online class including individual assignment statuses, thus allowing interactions like this:

Human: What's my next assignment?  
Bot: It's assignment 4 on prototyping a mobile interface [link]

Having authenticated against something like a Google or Facebook login.

Hubot and Skype are interestng related areas.  

We're trying to understand how hubot persists data between conversations (https://github.com/github/hubot/issues/373#issuecomment-11992999) and looks great in as much as hubot already has a skype plugin.  Skype is interesting because many online classes use its text chat for communication, but it seems that a skype bot must run as a client on someone's computer.

In the first instance we've decided to go with client side javascript since it can run in HTML pages, and give the most open possible access to the faqbot.  Ideally we'd like to see simple HTML pages with the chatbot interface where authenticated users can have conversations like this:

Human: There is a game engine Unreal Engine  
Bot: OK  
Human: What is Unreal Engine?  
Bot: Unreal Engine is a game  
Human: No, Unreal Engine is a game engine  
Bot: OK  
Human: What is Unreal Engine?  
Bot: Unreal Engine is a game engine

where effectively the human is providing a specification of how the bot should be responding to a question.  This specification should then be added automatically to the set of unit tests for the bot, so that it can be checked in future against subsequent changes in specification.
