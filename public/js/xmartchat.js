var xmartlabschat = {};
(function(publicScope) {
	var webSocket, userName, messagesListContainer, messagesList, messageBox, sendButton;

	publicScope.initialize = function(socket, usrname, containerId) {
		webSocket = socket;
		userName = usrname;

		createChatWindow(containerId);

		webSocket.on('chat', receiveChatMessage);
	}

	function createChatWindow(containerId){
		var chatContainer = $("#"+containerId);

		$("<div>").addClass("chat-header").html("Live chat").appendTo(chatContainer);

		messagesListContainer = $("<div>").addClass('chat-messages-container');
		messagesList = $('<ul>').addClass('chat-messages-list');
		messageBox = $('<textarea>').attr("placeholder","Write your message...");
		sendButton = $('<button>').addClass("btn btn-mini btn-primary pull-right").attr('type','submit').html("Send");
		var messageBoxContainer = $('<div>').addClass('chat-messagebox-container');

		messagesListContainer.append(messagesList);
		messageBoxContainer.append(messageBox).append(sendButton);
		chatContainer.append(messagesListContainer).append(messageBoxContainer);

		if(typeof $.fn.autogrow == 'function') {
			messageBox.autogrow();
		}

		messageBox.on('keypress', onChatKeyPress);
		sendButton.on('click', sendChatMessage);	
	}

	function addChatMessage(user, msg) {
		var backToBottom = 
			messagesListContainer[0].scrollHeight - messagesListContainer.scrollTop() - messagesListContainer.outerHeight() < 5;

		var message = $(document.createElement("li"));
		message.addClass("chat-message");

		message.append("<span class='message-date'>"+getHoursAndMinutes()+"</span>");

		message.append("<span class='sender'>"+user+"</span>");
		message.append("<p>"+msg+"</p>");

		messagesList.append(message);

		if(backToBottom) {
			messagesListContainer.animate({scrollTop: messagesListContainer[0].scrollHeight});
		}
	}

	function receiveChatMessage(data) {
		addChatMessage(data.sender, data.message);
	}

	function sendChatMessage() {
		var messageVal = messageBox.val().replace(/\n/g,"<br/>");
		if(messageVal){
			messageBox.val('');		
			addChatMessage(userName, messageVal);

			webSocket.send(messageVal);
		}
	}

	function onChatKeyPress(event) {
		// If the user has pressed enter
		if(event.which == 13 && !event.shiftKey) {
			event.preventDefault();
			sendChatMessage();
		}
	}

	function getHoursAndMinutes(){
		var date = new Date();
		var hours =	date.getHours().toString();
		var minutes = date.getMinutes().toString();
		if(hours.length < 2)
			hours = "0" + hours;
		if(minutes.length < 2)
			minutes = "0" + minutes;
		return hours+":"+minutes;
	}
})(xmartlabschat);