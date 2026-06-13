package tests;

import io.restassured.response.Response;
import org.testng.Assert;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.AfterTest;
import org.testng.annotations.Test;
import pages.AuthPage;
import pages.AccountPage;

public class AccountTest {
    private AuthPage authPage;
    private AccountPage accountPage;
    private String accessToken;
    private String instanceUrl;
    private String createdAccountId;

    @BeforeTest
    public void setUp() {
        try {
            authPage = new AuthPage();
            Response authResponse = authPage.requestToken(
                "YOUR_CLIENT_ID",
                "YOUR_CLIENT_SECRET",
                "YOUR_SALESFORCE_USERNAME",
                "YOUR_SALESFORCE_PASSWORD"
            );
            Assert.assertEquals(authResponse.getStatusCode(), 200);
            accessToken = authPage.extractAccessToken(authResponse);
            instanceUrl = authPage.extractInstanceUrl(authResponse);
            accountPage = new AccountPage(instanceUrl, accessToken);
        } catch (Exception e) {
            Assert.fail("Setup failed: " + e.getMessage());
        }
    }

    @AfterTest
    public void tearDown() {
        try {
            if (createdAccountId != null) {
                Response deleteResponse = accountPage.deleteAccount(createdAccountId);
                Assert.assertEquals(deleteResponse.getStatusCode(), 204);
            }
        } catch (Exception e) {
            Assert.fail("Teardown failed: " + e.getMessage());
        }
        authPage = null;
        accountPage = null;
    }

    @Test
    public void createAccountTest() {
        try {
            Response response = accountPage.createAccount("TestEnterpriseAccount");
            Assert.assertEquals(response.getStatusCode(), 201);
            createdAccountId = response.jsonPath().getString("id");
            Assert.assertNotNull(createdAccountId);
            Assert.assertTrue(createdAccountId.length() > 0);
        } catch (Exception e) {
            Assert.fail("Create account test failed: " + e.getMessage());
        }
    }

    @Test(dependsOnMethods = "createAccountTest")
    public void getAccountTest() {
        try {
            Response response = accountPage.getAccountById(createdAccountId);
            Assert.assertEquals(response.getStatusCode(), 200);
            Assert.assertEquals(response.jsonPath().getString("Name"), "TestEnterpriseAccount");
            Assert.assertEquals(response.jsonPath().getString("Id"), createdAccountId);
        } catch (Exception e) {
            Assert.fail("Get account test failed: " + e.getMessage());
        }
    }

    @Test(dependsOnMethods = "getAccountTest")
    public void updateAccountTest() {
        try {
            Response response = accountPage.updateAccount(createdAccountId, "UpdatedEnterpriseAccount");
            Assert.assertEquals(response.getStatusCode(), 204);
            Response getResponse = accountPage.getAccountById(createdAccountId);
            Assert.assertEquals(getResponse.getStatusCode(), 200);
            Assert.assertEquals(getResponse.jsonPath().getString("Name"), "UpdatedEnterpriseAccount");
        } catch (Exception e) {
            Assert.fail("Update account test failed: " + e.getMessage());
        }
    }

    @Test(dependsOnMethods = "updateAccountTest")
    public void deleteAccountTest() {
        try {
            Response response = accountPage.deleteAccount(createdAccountId);
            Assert.assertEquals(response.getStatusCode(), 204);
            Response getResponse = accountPage.getAccountById(createdAccountId);
            Assert.assertEquals(getResponse.getStatusCode(), 404);
            createdAccountId = null;
        } catch (Exception e) {
            Assert.fail("Delete account test failed: " + e.getMessage());
        }
    }
}
