package pages;

import io.restassured.response.Response;
import static io.restassured.RestAssured.given;

public class AccountPage {
    private String baseUri;
    private String accessToken;

    public AccountPage(String baseUri, String accessToken) {
        this.baseUri = baseUri;
        this.accessToken = accessToken;
    }

    public Response createAccount(String accountName) {
        try {
            String requestBody = String.format("{\"Name\":\"%s\"}", accountName);
            return given()
                .header("Authorization", "Bearer " + accessToken)
                .header("Content-Type", "application/json")
                .body(requestBody)
                .when()
                .post(baseUri + "/services/data/v58.0/sobjects/Account/")
                .then()
                .extract()
                .response();
        } catch (Exception e) {
            throw new RuntimeException("Account creation failed: " + e.getMessage(), e);
        }
    }

    public Response getAccountById(String accountId) {
        try {
            return given()
                .header("Authorization", "Bearer " + accessToken)
                .when()
                .get(baseUri + "/services/data/v58.0/sobjects/Account/" + accountId)
                .then()
                .extract()
                .response();
        } catch (Exception e) {
            throw new RuntimeException("Account retrieval failed: " + e.getMessage(), e);
        }
    }

    public Response updateAccount(String accountId, String accountName) {
        try {
            String requestBody = String.format("{\"Name\":\"%s\"}", accountName);
            return given()
                .header("Authorization", "Bearer " + accessToken)
                .header("Content-Type", "application/json")
                .body(requestBody)
                .when()
                .patch(baseUri + "/services/data/v58.0/sobjects/Account/" + accountId)
                .then()
                .extract()
                .response();
        } catch (Exception e) {
            throw new RuntimeException("Account update failed: " + e.getMessage(), e);
        }
    }

    public Response deleteAccount(String accountId) {
        try {
            return given()
                .header("Authorization", "Bearer " + accessToken)
                .when()
                .delete(baseUri + "/services/data/v58.0/sobjects/Account/" + accountId)
                .then()
                .extract()
                .response();
        } catch (Exception e) {
            throw new RuntimeException("Account deletion failed: " + e.getMessage(), e);
        }
    }
}
