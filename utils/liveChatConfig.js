/**
 * Live Chat Integration Configuration
 * 
 * This module provides configuration for integrating popular live chat services
 * such as Tawk.to, Intercom, Crisp, or custom chat solutions
 */

// Tawk.to Configuration (Free and Popular)
exports.getTawkToScript = () => {
  const tawkPropertyId = process.env.TAWK_PROPERTY_ID;
  const tawkWidgetId = process.env.TAWK_WIDGET_ID;

  if (!tawkPropertyId || !tawkWidgetId) {
    return null;
  }

  return `
    var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
    (function(){
      var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
      s1.async=true;
      s1.src='https://embed.tawk.to/${tawkPropertyId}/${tawkWidgetId}';
      s1.charset='UTF-8';
      s1.setAttribute('crossorigin','*');
      s0.parentNode.insertBefore(s1,s0);
    })();
  `;
};

// Intercom Configuration
exports.getIntercomScript = () => {
  const intercomAppId = process.env.INTERCOM_APP_ID;

  if (!intercomAppId) {
    return null;
  }

  return `
    window.intercomSettings = {
      app_id: "${intercomAppId}",
      custom_launcher_selector: '.chat-launcher'
    };
    (function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',w.intercomSettings);}else{var d=document;var i=function(){i.c(arguments);};i.q=[];i.c=function(args){i.q.push(args);};w.Intercom=i;var l=function(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/${intercomAppId}';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);};if(document.readyState==='complete'){l();}else if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})();
  `;
};

// Crisp Chat Configuration
exports.getCrispScript = () => {
  const crispWebsiteId = process.env.CRISP_WEBSITE_ID;

  if (!crispWebsiteId) {
    return null;
  }

  return `
    window.$crisp=[];
    window.CRISP_WEBSITE_ID="${crispWebsiteId}";
    (function(){
      d=document;
      s=d.createElement("script");
      s.src="https://client.crisp.chat/l.js";
      s.async=1;
      d.getElementsByTagName("head")[0].appendChild(s);
    })();
  `;
};

// Facebook Messenger Configuration
exports.getFacebookMessengerScript = () => {
  const fbPageId = process.env.FACEBOOK_PAGE_ID;

  if (!fbPageId) {
    return null;
  }

  return `
    window.fbAsyncInit = function() {
      FB.init({
        xfbml: true,
        version: 'v18.0'
      });
    };
    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); js.id = id;
      js.src = 'https://connect.facebook.net/en_US/sdk/xfbml.customerchat.js';
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  `;
};

// Get active chat configuration based on environment variables
exports.getActiveChatConfig = () => {
  const chatProvider = process.env.CHAT_PROVIDER || 'tawk';

  const configs = {
    tawk: {
      name: 'Tawk.to',
      script: exports.getTawkToScript(),
      widget: null
    },
    intercom: {
      name: 'Intercom',
      script: exports.getIntercomScript(),
      widget: null
    },
    crisp: {
      name: 'Crisp',
      script: exports.getCrispScript(),
      widget: null
    },
    facebook: {
      name: 'Facebook Messenger',
      script: exports.getFacebookMessengerScript(),
      widget: `<div class="fb-customerchat" attribution="setup_tool" page_id="${process.env.FACEBOOK_PAGE_ID}"></div>`
    }
  };

  const config = configs[chatProvider];
  
  if (!config || !config.script) {
    console.warn(`⚠️  Live chat not configured. Set CHAT_PROVIDER and corresponding credentials in .env`);
    return null;
  }

  return config;
};

// Custom socket-based chat configuration
exports.setupSocketChat = (io) => {
  const chatNamespace = io.of('/chat');

  chatNamespace.on('connection', (socket) => {
    console.log('User connected to chat:', socket.id);

    // Join user-specific room
    socket.on('join_chat', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined chat room`);
    });

    // Handle user messages
    socket.on('user_message', async (data) => {
      const { userId, message, userName } = data;
      
      // Broadcast to admin room
      chatNamespace.to('admin_room').emit('new_user_message', {
        userId,
        userName,
        message,
        timestamp: new Date()
      });

      // Save message to database (implement if needed)
      // await ChatMessage.create({ userId, message, sender: 'user' });
    });

    // Handle admin messages
    socket.on('admin_message', async (data) => {
      const { userId, message, adminName } = data;
      
      // Send to specific user
      chatNamespace.to(`user_${userId}`).emit('admin_reply', {
        adminName,
        message,
        timestamp: new Date()
      });

      // Save message to database (implement if needed)
      // await ChatMessage.create({ userId, message, sender: 'admin' });
    });

    // Admin joins admin room
    socket.on('join_admin', () => {
      socket.join('admin_room');
      console.log('Admin joined chat room');
    });

    socket.on('disconnect', () => {
      console.log('User disconnected from chat:', socket.id);
    });
  });

  return chatNamespace;
};
