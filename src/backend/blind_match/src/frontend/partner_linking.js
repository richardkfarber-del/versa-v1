function generateInviteCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 3; i++) result += characters.charAt(Math.floor(Math.random() * characters.length));
    result += '-';
    for (let i = 0; i < 3; i++) result += characters.charAt(Math.floor(Math.random() * characters.length));
    result += '-';
    for (let i = 0; i < 3; i++) result += characters.charAt(Math.floor(Math.random() * characters.length));
    document.getElementById('invite-code-display').value = result;
    alert('Invite code generated: ' + result);
}

function copyInviteCode() {
    const inviteCodeInput = document.getElementById('invite-code-display');
    if (inviteCodeInput.value) {
        navigator.clipboard.writeText(inviteCodeInput.value).then(() => {
            alert('Invite code copied to clipboard!');
        }).catch(err => {
            console.error('Could not copy text: ', err);
            alert('Failed to copy code. Please copy manually: ' + inviteCodeInput.value);
        });
    } else {
        alert('Please generate an invite code first.');
    }
}

function linkPartnerAccount() {
    const partnerCode = document.getElementById('partner-invite-code').value;
    if (partnerCode) {
        // In a real application, this would send the code to a backend for linking
        alert(`Attempting to link with partner code: ${partnerCode}. (Backend integration needed)`);
        // Simulate success and redirect to dashboard
        // window.location.href = 'dashboard.html';
    } else {
        alert('Please enter your partner's invite code.');
    }
}