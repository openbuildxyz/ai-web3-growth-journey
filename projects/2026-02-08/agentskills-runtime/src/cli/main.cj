/*
 * Copyright (c) UCToo Co., Ltd. 2026. All rights reserved.
 */
package magic.cli

/**
 * Main entry point for the CangjieMagic Agent Skill Runtime CLI
 * This executable allows users to manage and execute skills from the command line
 */
main(args: Array<String>): Unit {
    let cli = SkillCLI()
    cli.executeCommand(args)
}