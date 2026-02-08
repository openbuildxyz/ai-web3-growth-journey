/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2024. All rights reserved.
 */
package magic.tests

import magic.rag.splitter.*
import magic.utils.*
import std.unittest.testmacro.PowerAssert

private let MD_TEXT = """
# ChatChatTeam
Won the second runner-up of the "New Imagination of Productivity Tools" track of the AGI Playground Coding Marathon Hackathon.
## Report Introduction
AGI Playground Hackathon 2022, 16th, Founder's Park, Team ChatChat Showcases Outstanding Strength, 2022AGI Playground Hackathon, 2022 AGI Playground Hackat This competition is organized by founder Park and co-organized by Zhipu, Dify, Zilliz, Sound Network, AWS, and Cloud Services.
## Introduction to the Winners
+ Xiaoming, a university
  + Responsible for the development of agency travel assistants, site coordination, and group accommodations and travel arrangements
  + Made a major contribution in securing the team finish. As a team leader, Dong Yu adheres to the spirit of self-confidence, innovation, and calmness, continuously proposes improvement plans and implements them, and actively consults the teacher when encountering relevant problems, which improves the team's development efficiency.
# Hello
## Hello world
The competition attracted more than 120 teams, and 36 teams made it to the finals, of which 34 successfully completed the roadshow.
## Hello China
China won the championship.
## Problem of the Century
What eat for lunch? You have to choose one hour each time
## Why is it so hard to choose what to eat?
Because that's what we eat every day.
## What do young people need today?
More brain, more thought, more movement.

# Early to bed, early to rise
## Why Sleep Late?
Because I got off work too late.
## What are the dangers of sleeping late?
Sleeping late leads to sleepiness the next morning.
"""

@Test
class TestSplitter {
    @TestCase
    func testMarkdownSplitter(): Unit {
        let headersToSplit = [
            ("#", "Header 1"),
            ("##", "Header 2"),
            ("###", "Header 3")
        ]
        // Read md file to text
        let md = MarkdownSplitter(headersToSplit: headersToSplit, returnEachLine: false, stripHeader: true)
        let result = md.split(MD_TEXT)
        @Assert(result.size, 10)
    }
}