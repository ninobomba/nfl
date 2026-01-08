import axios from 'axios';
async function test() {
    try {
        console.log('Attempting local login test for admin...');
        const response = await axios.post('http://localhost:3000/api/auth/login', {
            username: 'admin',
            password: 'admin'
        });
        console.log('✅ Local test SUCCESS');
        console.log('Response status:', response.status);
        console.log('User Role:', response.data.user.role);
    }
    catch (error) {
        console.error('❌ Local test FAILED');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Message:', error.response.data.message);
        }
        else {
            console.error('Error:', error.message);
        }
    }
}
test();
//# sourceMappingURL=test-login.js.map