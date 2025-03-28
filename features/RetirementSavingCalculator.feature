@securian
Feature: Securian Website Navigation

Scenario Outline: Calculating the amount of retirement savings without updating the default values
    Given I am on the Securian website
    Then I enter the age details from "<TestCase>"
    Then I enter the saving details from "<TestCase>"
    Then I enter the social security details from "<TestCase>"
    When I submit the retirementcalculator form
    Then I should see the response with the amount of retirement savings

    Examples:
      | TestCase                      |
      | ReqAllFieldsWithoutAdjDefVals |

Scenario Outline: Calculating the amount of retirement savings with modified default values
    Given I am on the Securian website
    Then I enter the age details from "<TestCase>"
    Then I enter the saving details from "<TestCase>"
    Then I enter the social security details from "<TestCase>"
    Then I adjust the default values from "<TestCase>"
    When I submit the retirementcalculator form
    Then I should see the response with the amount of retirement savings
    Examples:
        | TestCase                                    |
        | ReqAllFieldsWithAdjstedDefVals_TestData1    |
        | ReqAllFieldsWithAdjstedDefVals_TestData2    |

Scenario Outline: Calculating the amount of retirement savings with current age(TC4),retirement age(TC5) > 120
    Given I am on the Securian website
    Then I enter the age details from "<TestCase>"
    Then I enter the saving details from "<TestCase>"
    Then I enter the social security details from "<TestCase>"
    When I submit the retirementcalculator form
    Then I should see the response with error message "<ErrorMessage>"


    Examples:
        | TestCase                    |ErrorMessage                  |
        | currentAgeGreaterThan120    |Age cannot be greater than 120|
        | retirementAgeGreaterThan120 |Age cannot be greater than 120|




  
