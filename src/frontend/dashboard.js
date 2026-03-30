document.addEventListener('DOMContentLoaded', () => {
    // Function to show a specific UI state and hide others
    window.toggleUIState = function(stateId) {
        const states = document.querySelectorAll('.ui-state');
        states.forEach(state => {
            state.style.display = 'none';
        });

        const activeState = document.getElementById(stateId + '-state');
        if (activeState) {
            activeState.style.display = 'block';
        }
    };

    // Initial state (e.g., No Partner)
    toggleUIState('no-partner');

    // Example functions for buttons
    window.copyInviteCode = function() {
        alert('Invite Code Copied!');
        // In a real app, you would copy the code to clipboard
    };

    window.nudgePartner = function() {
        alert('Partner Nudged! Notification sent.');
        // In a real app, this would trigger a push notification
    };
});