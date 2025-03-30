/// Module: ai_goal
module ai_goal::ai_goal {
    use std::string::String;
    use sui::object::{UID, ID};
    use sui::tx_context::TxContext;

    // 目标结构体
    struct Goal has key, store {
        id: UID,
        content: String,      // 目标内容
        ai_suggestion: String // AI建议
    }

    // Agent结构体
    struct Agent has key, store {
        id: UID,
        agent_id: String,     // Agent标识
        character_json: String // Agent特征JSON
    }

    // 目标管理器
    struct GoalManager has key {
        id: UID,
        user_goals: vector<ID>,       // 用户目标映射
        user_agents: vector<ID>       // 用户Agent映射
    }

    // 创建新目标
    public entry fun create_goal(
        content: String,
        ai_suggestion: String,
        ctx: &mut TxContext
    ): Goal {
        Goal {
            id: object::new(ctx),
            content,
            ai_suggestion
        }
    }

    // 创建新Agent
    public entry fun create_agent(
        agent_id: String,
        character_json: String,
        ctx: &mut TxContext
    ): Agent {
        Agent {
            id: object::new(ctx),
            agent_id,
            character_json
        }
    }

    // 初始化目标管理器
    public entry fun init_goal_manager(ctx: &mut TxContext) {
        let goal_manager = GoalManager {
            id: object::new(ctx),
            user_goals: vector::empty(),
            user_agents: vector::empty()
        };
        transfer::public_transfer(goal_manager, tx_context::sender(ctx));
    }

    // 添加目标到管理器
    public entry fun add_goal_to_manager(
        goal_manager: &mut GoalManager,
        goal: Goal,
        _: &TxContext
    ) {
        vector::push_back(&mut goal_manager.user_goals, object::id(&goal));
        transfer::public_transfer(goal, tx_context::sender(_));
    }

    // 添加Agent到管理器
    public entry fun add_agent_to_manager(
        goal_manager: &mut GoalManager,
        agent: Agent,
        _: &TxContext
    ) {
        vector::push_back(&mut goal_manager.user_agents, object::id(&agent));
        transfer::public_transfer(agent, tx_context::sender(_));
    }
}



