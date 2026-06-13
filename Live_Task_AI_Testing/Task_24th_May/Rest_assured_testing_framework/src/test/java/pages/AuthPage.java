package pages;

import io.restassured.response.Response;
import static io.restassured.RestAssured.given;

public class AuthPage {
    private static final String TOKEN_URL = "https://login.salesforce.com/services/oauth2/token";

    public Response requestToken(String clientId, String clientSecret, String username, String password) {
        try {
            return given()
                .param("grant_type", "password")
                .param("client_id", clientId)
                .param("client_secret", clientSecret)
                .param("username", username)
                .param("password", password)
                .when()
                .post(TOKEN_URL)
                .then()
                .extract()
                .response();
        } catch (Exception e) {
            throw new RuntimeException("Token request failed: " + e.getMessage(), e);
        }
    }

    public Response requestTokenInvalidCredentials(String clientId, String clientSecret, String username, String password) {
        try {
            return requestToken(clientId, clientSecret, username, password);
        } catch (Exception e) {
            throw new RuntimeException("Invalid token request failed: " + e.getMessage(), e);
        }
    }

    public String extractAccessToken(Response response) {
        try {
            return response.jsonPath().getString("access_token");
        } catch (Exception e) {
            throw new RuntimeException("Failed to extract access token: " + e.getMessage(), e);
        }
    }

    public String extractInstanceUrl(Response response) {
        try {
            return response.jsonPath().getString("instance_url");
        } catch (Exception e) {
            throw new RuntimeException("Failed to extract instance URL: " + e.getMessage(), e);
        }
    }
}
