var xmartlabschat = {};
(function(publicScope) {

	var user = {};
	var users = {};
	var usersCount, messagesListContainer, messagesList, messageBox, sendButton;
	
	publicScope.users = users;
	publicScope.user = user;

	publicScope.initialize = function(username, socket, containerId) {
		user.name = username;
		webSocket = socket;

		createChatWindow(containerId);

		webSocket.on("user connected", addUser);
		webSocket.on("user disconnected", removeUser);
		webSocket.on('chat', receiveChatMessage);

		webSocket.emit('register', { name : user.name }, function(key){ user.key = key; });
	}

	function addUser(user){
		if(!users[user.key])
			updateUsersCount(1);
		users[user.key] = user;
	}
	publicScope.addUser = addUser;

	function removeUser(key){
		if(users[key]) {
			delete users[key];		
			updateUsersCount(-1);
		}
	}

	function updateUsersCount(diff){
			var currentCount = parseInt(usersCount.html()) + diff;
			usersCount.html(currentCount);
	}

	function receiveChatMessage(data) {
		addChatMessage(data.sender, data.key, data.message);
	}

	function sendChatMessage() {
		if(/\S/.test(messageBox.val())){
			var messageVal = messageBox.val().replace(/\n/g,"<br/>");
			messageBox.val('');		
			addChatMessage(user.name, user.key, messageVal);
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

	function addChatMessage(sender, key, msg) {
		var backToBottom = 
			messagesListContainer[0].scrollHeight - messagesListContainer.scrollTop() - messagesListContainer.outerHeight() < 5;

		var message = $(document.createElement("li"));
		message.addClass("chat-message");

		message.append("<span class='message-date'>"+xmartlabsutil.getHoursAndMinutes()+"</span>");

		$("<span class='sender btn-link'>"+sender+"</span>").data('key',key).appendTo(message);
		message.append("<p>"+msg+"</p>");

		messagesList.append(message);

		if(backToBottom)
			messagesListContainer.animate({scrollTop: messagesListContainer[0].scrollHeight});
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

		messageBox.on('keypress', onChatKeyPress);
		sendButton.on('click', sendChatMessage);	

		usersCount = $("#usersCount");

		if(typeof $.fn.autogrow == 'function')
			messageBox.autogrow();
	}
})(xmartlabschat);