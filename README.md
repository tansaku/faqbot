faqbot
======

JavaScript chat bot to answer frequently asked questions (faq)

----

Most Natural Language Processing (NLP) approaches seem to be focused on how to parse sentences - not on how to construct sentences that match some model of the world (notable exception is SHRDLU)

Most Chatbots seem designed to have a fixed database of material (AIML), use regexp (Eliza), although some do learn and remember word occurrence probabilities (MegaHAL)

There appears to be an interesting opportunity for a chatbot that made additional use of NLP techniques and a good persistence framework in order to be a repository for knowledge and provide support in online text chat environments.

This project is aiming to create a chatbot that can have a knowledge base updated by individual users through a process of discussion, e.g.  

Human: There is a game engine Unity3S  
Bot: OK  
Human: What is Unity3D?  
Bot: Unity3D is a game engine
Human: Unity3D has a URL of http://www.studica.com/unity
Bot: OK
Human: What is the URL for Unity3D? 
Bot: The URL for Unity3D is http://www.studica.com/unity

Ideally all conversations will be stored in the cloud, but not rely on having to maintain a specific server.  In the first instance Github Gists seem like a good idea.  An authenticated Github user could have gists created associated with their own user account.  Although ideally the chatbot won't be tied to a particular persistence framework.

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

Open Issues:

1) need support for named entity recognition in NaturalJS
2) need to fix on a first HTML interface
3) would like to provide predictive text look up to help scaffold users chatting with bot

Background

The current design of this system arises from an earlier attempt to implement the same approach in Python with the NLTK.  This worked fine, except that it was not straightforward to install support for the NLTK on a cloud hosting service like Heroku.  Also it seemed that members of the project were unlikely to download and hack on a python project that meant getting set up with NLTK locally.  It seemed that if we made available a pure HTML interface that didn't rely on having particular software libraries installed on a server, and that chatting to the bot would mirror the process of generating unit tests for it's operation, then it might be easier to get more people involved.  Ultimately the project can use any technology, but it makes sense to get some serious prototyping done by making simple versions of the system as accessible as possible.
