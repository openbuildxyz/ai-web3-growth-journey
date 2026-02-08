/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.examples.skill_examples

import std.collection.HashMap
import stdx.encoding.json.{JsonValue, JsonString, JsonFloat}

/**
 * Example skill execution tests (without unittest framework to avoid build errors)
 */
public class ExampleSkillExecutionTestRunner {
    public func runAllTests(): Unit {
        testGreetingSkillExecution()
        testGreetingSkillExecutionWithDefault()
        testCalculatorSkillAddition()
        testCalculatorSkillSubtraction()
        testCalculatorSkillMultiplication()
        testCalculatorSkillDivision()
        testCalculatorSkillDivisionByZero()
        testCalculatorSkillDefaultOperation()
        print("All skill execution tests completed.")
    }

    public func testGreetingSkillExecution() {
        let greetingSkill = GreetingSkill()
        let args = HashMap<String, JsonValue>()
        args.add("name", JsonString("Alice"))

        let result = greetingSkill.execute(args)

        if (!result.contains("Hello, Alice")) {
            print("ERROR: testGreetingSkillExecution failed - result does not contain 'Hello, Alice'")
        } else {
            print("SUCCESS: testGreetingSkillExecution passed")
        }

        if (!result.contains("CangjieMagic framework")) {
            print("ERROR: testGreetingSkillExecution failed - result does not contain 'CangjieMagic framework'")
        } else {
            print("SUCCESS: testGreetingSkillExecution passed")
        }
    }

    public func testGreetingSkillExecutionWithDefault() {
        let greetingSkill = GreetingSkill()
        let args = HashMap<String, JsonValue>()  // No name provided

        let result = greetingSkill.execute(args)

        if (!result.contains("Hello, Friend")) {
            print("ERROR: testGreetingSkillExecutionWithDefault failed - result does not contain 'Hello, Friend'")
        } else {
            print("SUCCESS: testGreetingSkillExecutionWithDefault passed")
        }
    }

    public func testCalculatorSkillAddition() {
        let calculatorSkill = CalculatorSkill()
        let args = HashMap<String, JsonValue>()
        args.add("operation", JsonString("add"))
        args.add("a", JsonFloat(5.0))
        args.add("b", JsonFloat(3.0))

        let result = calculatorSkill.execute(args)

        if (!result.contains("5 add 3 = 8")) {
            print("ERROR: testCalculatorSkillAddition failed - result does not contain '5 add 3 = 8'")
        } else {
            print("SUCCESS: testCalculatorSkillAddition passed")
        }
    }

    public func testCalculatorSkillSubtraction() {
        let calculatorSkill = CalculatorSkill()
        let args = HashMap<String, JsonValue>()
        args.add("operation", JsonString("subtract"))
        args.add("a", JsonFloat(10.0))
        args.add("b", JsonFloat(4.0))

        let result = calculatorSkill.execute(args)

        if (!result.contains("10 subtract 4 = 6")) {
            print("ERROR: testCalculatorSkillSubtraction failed - result does not contain '10 subtract 4 = 6'")
        } else {
            print("SUCCESS: testCalculatorSkillSubtraction passed")
        }
    }

    public func testCalculatorSkillMultiplication() {
        let calculatorSkill = CalculatorSkill()
        let args = HashMap<String, JsonValue>()
        args.add("operation", JsonString("multiply"))
        args.add("a", JsonFloat(6.0))
        args.add("b", JsonFloat(7.0))

        let result = calculatorSkill.execute(args)

        if (!result.contains("6 multiply 7 = 42")) {
            print("ERROR: testCalculatorSkillMultiplication failed - result does not contain '6 multiply 7 = 42'")
        } else {
            print("SUCCESS: testCalculatorSkillMultiplication passed")
        }
    }

    public func testCalculatorSkillDivision() {
        let calculatorSkill = CalculatorSkill()
        let args = HashMap<String, JsonValue>()
        args.add("operation", JsonString("divide"))
        args.add("a", JsonFloat(15.0))
        args.add("b", JsonFloat(3.0))

        let result = calculatorSkill.execute(args)

        if (!result.contains("15 divide 3 = 5")) {
            print("ERROR: testCalculatorSkillDivision failed - result does not contain '15 divide 3 = 5'")
        } else {
            print("SUCCESS: testCalculatorSkillDivision passed")
        }
    }

    public func testCalculatorSkillDivisionByZero() {
        let calculatorSkill = CalculatorSkill()
        let args = HashMap<String, JsonValue>()
        args.add("operation", JsonString("divide"))
        args.add("a", JsonFloat(10.0))
        args.add("b", JsonFloat(0.0))

        let result = calculatorSkill.execute(args)

        if (!result.contains("Error: Division by zero")) {
            print("ERROR: testCalculatorSkillDivisionByZero failed - result does not contain 'Error: Division by zero'")
        } else {
            print("SUCCESS: testCalculatorSkillDivisionByZero passed")
        }
    }

    public func testCalculatorSkillDefaultOperation() {
        let calculatorSkill = CalculatorSkill()
        let args = HashMap<String, JsonValue>()  // No operation specified, defaults to add
        args.add("a", JsonFloat(2.0))
        args.add("b", JsonFloat(3.0))

        let result = calculatorSkill.execute(args)

        if (!result.contains("2 add 3 = 5")) {
            print("ERROR: testCalculatorSkillDefaultOperation failed - result does not contain '2 add 3 = 5'")
        } else {
            print("SUCCESS: testCalculatorSkillDefaultOperation passed")
        }
    }
}