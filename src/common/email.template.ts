export const inviteAdminEmailTemplate = (adminName: string, accountDetails: { email: string; password: string }) => {
  return `
        <html>
            <body>
                <h1>Welcome, ${adminName}!</h1>
                <p>Your admin account has been created successfully. Here are your account details:</p>
                <ul>
                    <li><strong>Email:</strong> ${accountDetails.email}</li>
                    <li><strong>Password:</strong> ${accountDetails.password}</li>
                </ul>
                <p>Please log in to the admin portal and change your password immediately.</p>
                <p>Thank you!</p>
            </body>
        </html>
    `;
};

export const assignClientToAdminEmailTemplate = (adminName: string, clientName: string) => {
  return `
                <html>
                        <body>
                                <h1>Hello, ${adminName}!</h1>
                                <p>You have been assigned a new client: ${clientName}.</p>
                                <p>Please log in to the admin portal to view the client's details and manage their account.</p>
                                <p>Thank you!</p>
                        </body>
                </html>
        `;
};
