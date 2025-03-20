@securian
Feature: Securian Website Navigation
@retiremenetSavingswithpositiveandNegativeScenarios
Scenario Outline: Calculating the amount of retirement savings without updating the default values
    Given I am on the Securian website
    Then  I enter the age,saving and social security data from "<TestCase>"
    Then I click on the Calculate button

    Examples:
        | TestCase |
        | TC01     |

Scenario Outline: Calculating the amount of retirement savings with modified default values
    Given I am on the Securian website
    Then I enter the retirement data from "<TestCase>"
    Then I click on the Calculate button

    Examples:
        | TestCase |
        | TC02     |
        | TC03     |

Scenario Outline: Calculating the amount of retirement savings with current age(TC4),retirement age(TC5) > 120
    Given I am on the Securian website
    Then  I enter the age,saving and social security data from "<TestCase>"
    Then I click on the Calculate button

    Examples:
        | TestCase |
        | TC04     |
        | TC05     |


  
