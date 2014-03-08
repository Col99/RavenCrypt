## RavenCrypt

[RavenCrypt](http://ravencrypt.net/) Perfect Forward Secrecy Communication and Social Blogging Service!

## What is It

Client Component using Angular JS and Server Component using Node.JS that represent a modern Instant Messenger and more.

### Status

Pre-Alpha. The server and protocol are getting into a clear shape now, but are far from having a written down standard.
You should read EXPERIMENTAL.MD and also the DENIALOFSERVICE.md. This project is young and has a long way to go.
Go use good ol' PGP Mail, before you should have hopes for it. It will take some time before you can actually use it,
let alone put even an inch of trust onto it.

### Implementation

Everything here will be implemented in JavaScript. This Software should run on every modern platform, as long as it has a browser
and will be made available for mobile phones via phonegap. If we need secure key stores and external key storage devices later,
there is (or will be) a way to do that too, if somebody takes the effort or the browser vendors get it working. (Think EMScripten.)

The servers in this project are organized like Dead Drops and never speak to each other, what makes the protocol different from Mail.
The client delivers his messages directly to the sever of his contact, which acts as an inbox.
This avoids the heavy reliance for correctly configured mail severs and is a huge improvement here. This setup should also be more reliable,
trough instant delivery confirmation to the receiving server, have less delivery delays and uses TLS for transport encryption
as well as the well known HTTP Protocol and REST schemes so no firewall will get any ideas, though its not bound to any specific port.

Spam is a concern here but should be easy to deal with, if it ever becomes a real problem.

### Goals

RavenCrypt should offer a strong cryptographic replacement for, mail, xmpp, thumbleblogs and social networks.
It should only use web Technologies (JS, HTML5, AngularJS, Socket.IO) to achieve this and only rely on proven to work crypto.
Everything used in this project is part of PGP(OpenPGP.JS). The actual algorithms used are abstracted so
that they are exchangeable, just like pgp itself does it, which should make this project sustainable.

The main improvement over PGP and Mail is the exchange of ComKeys in a "DHE-Like" fashion and the server organization.
This exchange is set up in a way that multi client messaging is possible. It also supports the ability post signed blog entries.
This protects them against manipulation and can help to build trust into someone (e.g. a journalist).

The intended use is from private persons, to small and big companies as well as any kind of civil organisation.
The Server component is written in Node.JS and should be easy to setup and maintain, even for people with basic system knowledge.
Even if you are unable to host your own server, you should be able to use the "space ship system administrator scheme",
where you know the person hosting your server, instead of trusting some big company, which is a huge improvement.
However that person still won't be able to see WHAT you are writing, just to WHOM, however nobody else does.

Nevertheless its planed to host one "official" node for people that have nobody or are just lazy later.
The whole protocol and client will be build in a way that there is NO FAVOURITISM WHATS SO EVER regarding which server you use,
so this project will never end up like other services where you can implement your own client,
but have no control over the server and the way your data is saved.

Another small official server is planed later to bridge the PhoneNr to RC gap (see PhoneToRcService).

All of the Server implementations are licensed under the AGPL, so you can look at the code yourself. :-)

### Remaining Problems

There is nothing that will protect users against lost Private keys. There should just be an easy method for import/export of those later.
(QR Code Generator/Scanner, NFC reader etc.) RavenCrypt should not provide any hipster voodo cloud storage for private Keys.
There is no simple way to protect those online. Just use 2 or more devices with the same key or do any other form of backup you can rely on.
Also, as there is a server involved, you can at least retain your address later, so this is not like loosing the key to your Bitcoin wallet.

The other "problem" is that we are still relying on the DNS System to work and also use the TLS encryption to secure transports against MITM attacks,
but those are ultimately parts the user can exchange himself and do not fall into our responsibility (e.g. using different DNS servers and better Browsers)

### Outlook

This is an ongoing Project. The target is getting into a state where this its actually usable.
The long term goal is to improve this project into a state where people can use it as a reliable open source IM communication service.
The ultimate goal is to offer a good replacement for big money controlled social voodo and E-Mail.

The first version will launch with support for encrypted images and attachments.
(the Current size limit is 2MB but that could increase depending on what you configure in your server).
The setup here is completely different from E-Mail attachments, so there are none of the usual problems involved.

In later Versions it should be fairly easy to establish web-rtc connections. The current organisation of sever and
clients should allows us to implement audio/video chats without any huge additional effort.

We need to create critical mass with a good PFS implementation. This is just one of many attempts.
The project should reach a 1.0 version that works, regardless if its ends up getting used or not.
We had an idea on how to do crypto for more than two decades now and nobody cared. This really should make people MAD.

### Licenses

The License is AGPL v3 vor the Sever and LGPL v2.1 for the Client, which is inherited from OpenPGP.Js. Hopefully this setup makes sense for everybody.

