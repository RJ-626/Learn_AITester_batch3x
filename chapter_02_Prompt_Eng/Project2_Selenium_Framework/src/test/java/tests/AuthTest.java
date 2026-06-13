package tests;

import io.restassured.response.Response;
import org.testng.Assert;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.AfterTest;
import org.testng.annotations.Test;
import pages.AuthPage;

public class AuthTest {
    private AuthPage authPage;

    @BeforeTest
    public void setUp() {
        try {
            authPage = new AuthPage();
        } catch (Exception e) {
            Assert.fail("Setup failed: " + e.getMessage());
        }
    }

    @AfterTest
    public void tearDown() {
        authPage = null;
    }

    @Test
    public void validLoginTest() {
        try {
            Response response = authPage.requestToken(
                "YOUR_CLIENT_ID",
                "YOUR_CLIENT_SECRET",
                "YOUR_SALESFORCE_USERNAME",
                "YOUR_SALESFORCE_PASSWORD"
            );
            Assert.assertEquals(response.getStatusCode(), 200);
            Assert.assertNotNull(response.jsonPath().getString("access_token"));
            Assert.assertNotNull(response.jsonPath().getString("instance_url"));
            Assert.assertNotNull(response.jsonPath().getString("token_type"));
            Assert.assertNotNull(response.jsonPath().getString("issued_at"));
        } catch (Exception e) {
            Assert.fail("Valid login test failed: " + e.getMessage());
        }
    }

    @Test
    public void invalidLoginTest() {
        try {
            Response response = authPage.requestTokenInvalidCredentials(
                "invalid_client_id",
                "invalid_client_secret",
                "invalid_username",
                "invalid_password"
            );
            Assert.assertEquals(response.getStatusCode(), 400);
            String error = response.jsonPath().getString("error");
            String errorDescription = response.jsonPath().getString("error_description");
            Assert.assertNotNull(error);
            Assert.assertNotNull(errorDescription);
        } catch (Exception e) {
            Assert.fail("Invalid login test failed: " + e.getMessage());
        }
    }
}
