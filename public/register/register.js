function saveOrderItems() {
    if (document.getElementById("password-repeat").value != document.getElementById("password").value) {
        alert('FAIL: password and repeat-password must be the same!')
    } else alert("PASS")
}