/*
 * Copyright (c) UCToo Co., Ltd. 2026. All rights reserved.
 */
package magic.skill.examples

import magic.dsl.skill
import std.collection.HashMap
import std.time.DateTime
import stdx.encoding.json.{JsonValue, JsonObject, JsonString, JsonInt}

/**
 * Example skill demonstrating the use of the @skill DSL with uctoo-inspired features
 */
/*
@skill(
    name = "greeting-skill",
    description = "A simple skill that generates personalized greetings",
    license = "MIT",
    metadata = {
        author = "CangjieMagic Team",
        version = "1.0.0",
        category = "utility"
    },
    security = "restricted",
    capabilities = "network,file-read",
    executionTimeout = "30s",
    resourceLimits = "memory:100MB,cpu:10%"
)
*/
public class GreetingSkill {
    public func greet(name: String, language: String): String {
        let greeting = match (language) {
            case "en" => "Hello, "
            case "zh" => "你好, "
            case "es" => "Hola, "
            case "fr" => "Bonjour, "
            case "de" => "Hallo, "
            case _ => "Hello, "
        }

        return greeting + name + "!"
    }

    /**
     * Greet with default language (English)
     */
    public func greet(name: String): String {
        return greet(name, "en")
    }
    
    public func greetWithTime(name: String): String {
        // This method demonstrates a slightly more complex operation
        let currentTime = DateTime.now().toString()
        return "Hello ${name}! The current time is ${currentTime}."
    }
}

/**
 * Another example skill demonstrating different capabilities
 */
/*
@skill(
    name = "calculator-skill",
    description = "A basic calculator skill for arithmetic operations",
    license = "MIT",
    metadata = {
        author = "CangjieMagic Team",
        version = "1.0.0",
        category = "utility"
    },
    security = "low",
    capabilities = "none",
    executionTimeout = "10s",
    resourceLimits = "memory:50MB,cpu:5%"
)
*/
public class CalculatorSkill {
    public func add(a: Int32, b: Int32): String {
        let result = a + b
        return "${a} + ${b} = ${result}"
    }
    
    public func subtract(a: Int32, b: Int32): String {
        let result = a - b
        return "${a} - ${b} = ${result}"
    }
    
    public func multiply(a: Int32, b: Int32): String {
        let result = a * b
        return "${a} * ${b} = ${result}"
    }
    
    public func divide(a: Int32, b: Int32): String {
        if (b == 0) {
            return "Error: Division by zero"
        }
        let result = a / b
        return "${a} / ${b} = ${result}"
    }
}

/**
 * Example skill with network capabilities
 */
/*
@skill(
    name = "weather-skill",
    description = "A skill to get weather information (simulated)",
    license = "MIT",
    metadata = {
        author = "CangjieMagic Team",
        version = "1.0.0",
        category = "information"
    },
    security = "medium",
    capabilities = "network",
    executionTimeout = "15s",
    resourceLimits = "memory:75MB,cpu:7%"
)
*/
public class WeatherSkill {
    public func getWeather(city: String): String {
        // Simulate getting weather data
        // In a real implementation, this would make an HTTP request
        return "Weather in ${city}: Sunny, 22°C, light breeze"
    }
    
    public func getForecast(city: String, days: Int32): String {
        // Simulate getting weather forecast
        return "Forecast for ${city} over ${days} days: Mostly sunny with temperatures between 20-25°C"
    }
}