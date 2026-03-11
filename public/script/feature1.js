// ===================================================================================
// ========================== "DON'T PEEK" POPUP FEATURE =============================
// ===================================================================================

function initializeSecurityPopup() {
    // --- Your 5 Random Messages ---
	/*
        
        
        "Console kholva thi job madse nai, portfolio check kar ne...!",
        "This code is like a treasure chest, but it's locked! Want to see what's inside? Check out my projects page.",
        "This code is like a secret vault, but it's locked! Want to see what's inside? Check out my projects page.",
        "Kem cho hacker ? Aa code private chhe, so code kyarey nahi dekhay...!",
        "You've found the developer's entrance! But this area is off-limits. The front door is back on the main page.",
        "Arey developer balak, aa console bypass karvathi thi tane koi faydo nathi malvano!",
        "Code to private party jevo chhe, jovo hoy to projects ma chhe tya ja...",
        "Arey bhai, console me ghusne se job nahi milegi! Projects bhi dekhne padte hai, wahi asli magic hai!",
        "Hey kid.., yeh secret zone hai. Projects section me jao, waha mast cheezein hain!",
        "Oye hacker, console band kar aur portfolio explore kar...",
        "Developer ban’na hai toh console spying nahi, projects seekhna padega!",
        "Console ma su jovo cho? Portfolio ma projects na direct darshan karo...!",
        "Nadaan Balak, aahiya nana balako mate entry restricted chhe. Entry to projects ma chhe!",
        "Console ni andar sukh nathi, dukh chhe, projects explore karso to j sukh malse...!"
		*/
	const messages = [
		"Restricted Area! Copy or inspecting is disabled.",
        "Curiosity is a great trait for a developer! But this code is shy. Let's chat if you want to know more.",
        "Nice try! The real magic is in the live projects, not in the console. Go have a look!",
        "Hey, I see you! My code is my secret recipe. How about checking out my projects instead?",
		"Developer tools are restricted!",
        "This code is like a secret vault, but it's locked! Want to see what's inside? Check out my projects page."
    ];

    let popupVisible = false;
    let autoCloseTimer;

    function showSecurityPopup(event) {
        // Prevent the default action (e.g., opening the context menu)
        event.preventDefault();

        // If a popup is already showing, do nothing.
        if (popupVisible) return;
        popupVisible = true;

        // 1. Select a random message
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];

        // 2. Create the popup elements dynamically
        const overlay = document.createElement('div');
        overlay.className = 'security-popup-overlay';

        const popup = document.createElement('div');
        popup.className = 'security-popup';

        popup.innerHTML = `
            <div class="security-popup-icon">
      <i class="fas fa-user-secret" style="color: white; background: blue; padding: 15px; border-radius: 20%; font-size: 25px;"></i> | 
      <i class="fas fa-shield-alt" style="color: white; background: red; padding: 15px; border-radius: 20%; font-size: 25px;"></i> | 
      <i class="fas fa-exclamation-triangle" style="color: white; background: orange; padding: 15px; border-radius: 20%; font-size: 25px;"></i>
    </div>

    <i class="fas fa-exclamation-circle" 
       style="color: orange; margin-top: 10px; font-size: 20px;"></i>

    <div class="security-popup-title" style="font-weight: bold; font-size: 22px; margin: 10px 0; color: red;">
      Security Alert
    </div>

    <p class="security-popup-message">${randomMessage}</p>
    <button class="security-popup-close" aria-label="Close">
      <i class="fas fa-times" aria-hidden="true"></i>
    </button>
<script>
  anime({
    targets: '.security-popup-title',
    opacity: [1, 0],
    duration: 800,
    easing: 'easeInOutSine',
    direction: 'alternate',
    loop: true
  });
</script>
        `;

        overlay.appendChild(popup);
        document.body.appendChild(overlay);

        // 3. Animate the popup IN with GSAP
        gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.3 });
        gsap.fromTo(popup, 
            { opacity: 0, scale: 0.9, y: -20 },
            { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'power2.out', delay: 0.1 }
        );

        // 4. Set the auto-close timer
        autoCloseTimer = setTimeout(() => closePopup(overlay), 7500); // Closes after 6.5 seconds

        // 5. Add event listener to the close button
        popup.querySelector('.security-popup-close').addEventListener('click', () => {
            closePopup(overlay);
        });
    }

    function closePopup(overlay) {
        // Clear the auto-close timer to prevent it from running if closed manually
        clearTimeout(autoCloseTimer);

        gsap.to(overlay, {
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
                overlay.remove();
                popupVisible = false; // Reset the flag
            }
        });
    }

    // --- Attach the event listeners ---
    document.addEventListener('contextmenu', showSecurityPopup);
    document.addEventListener('keydown', (event) => {
        const isDevToolsKey = event.key === "F12" ||
            (event.ctrlKey && event.shiftKey && ['I', 'J', 'C'].includes(event.key.toUpperCase())) ||
            (event.ctrlKey && event.key.toUpperCase() === 'U');

        if (isDevToolsKey) {
            showSecurityPopup(event);
        }
    });

    console.log("Unique security feature initialized.");
}