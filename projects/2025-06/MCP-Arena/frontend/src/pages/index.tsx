import type { NextPage } from 'next';
import Layout from '../components/Layout';
import styles from '../styles/Home.module.css';
import Link from 'next/link';
import Image from 'next/image';

const Home: NextPage = () => {
  return (
    <Layout title="MCP Arena - Home">
      <div className={styles.homeContainer}>
        <section className={styles.hero}>
          <h1 className={styles.title}>MCP-Arena</h1>
          <h2 className={styles.subtitle}>A Fair & Public MCP Service Marketplace and Rating & Reward System</h2>
          <p className={styles.description}>
            MCPArena 是面向 AI/Agent 的 Model Context Protocol（MCP）的 Web3 公开市场，
            支持任何传统行业、AI 或 Web3 服务作为 MCP 服务提供方入驻 MCPArena Marketplace。
          </p>
          <div className={styles.buttonGroup}>
            <Link href="/upload" className={styles.primaryButton}>注册 MCP 服务</Link>
            <Link href="/marketplace" className={styles.secondaryButton}>浏览服务市场</Link>
          </div>
        </section>

        <section className={styles.features}>
          <h2 className={styles.sectionTitle}>MCP Arena 核心功能</h2>
          <div className={styles.grid}>
            <div className={styles.card}>
              <h3>服务注册与发现</h3>
              <p>MCP 服务供应商可以通过 MCPArena 注册其 MCP 服务，提供服务的详细信息、性能指标以及服务级别协议。</p>
            </div>
            <div className={styles.card}>
              <h3>服务评级与监控</h3>
              <p>MCPArena 会持续监控 MCP 服务的质量、性能和安全风险。根据评级标准，MCP 服务供应商会获得相应的评级。</p>
            </div>
            <div className={styles.card}>
              <h3>服务调用与计费</h3>
              <p>用户可以通过 MCPArena 网关调用 MCP 服务。MCPArena 会根据用户的调用请求和服务评级，计算并收取相应的费用。</p>
            </div>
            <div className={styles.card}>
              <h3>奖励机制</h3>
              <p>MCPArena 基于 Stake–Slash–Reward 激励机制为表现优秀的 MCP 服务供应商提供奖励。</p>
            </div>
          </div>
        </section>

        <section className={styles.architecture}>
          <h2 className={styles.sectionTitle}>MCP Arena 架构</h2>
          <div className={styles.architectureContent}>
            <div className={styles.architectureText}>
              <p>MCPArena 采用模块化架构，包括前端、后端、智能合约和链下组件。</p>
              <ul className={styles.architectureList}>
                <li><strong>前端</strong>：提供用户界面，用于注册、登录、发现和调用 MCP 服务。</li>
                <li><strong>后端</strong>：处理业务逻辑、数据存储和与链下组件的交互，负责监测服务质量、安全风险以及奖励的发放。</li>
                <li><strong>智能合约</strong>：MCP 服务的 stake-slash-reward 激励机制。</li>
              </ul>
            </div>
          </div>
        </section>

        <section className={styles.incentive}>
          <h2 className={styles.sectionTitle}>MCP Arena 激励机制</h2>
          <div className={styles.incentiveContent}>
            <div className={styles.incentiveItem}>
              <h3>质押机制</h3>
              <p>用户可以通过 MCPArena 前端将一定数量的代币质押在 MCP 服务供应商上。质押的代币作为服务提供商的权益凭证。</p>
            </div>
            <div className={styles.incentiveItem}>
              <h3>奖励机制</h3>
              <p>MCP 服务供应商根据其服务质量评级和安全风险情况，获得相应的奖励。奖励的金额根据服务提供商的质押金额和服务质量评级动态调整。</p>
            </div>
            <div className={styles.incentiveItem}>
              <h3>惩罚机制</h3>
              <p>若 MCP 服务供应商违反服务级别协议或出现安全问题，其质押的代币将被 slashed（削减）。</p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Home;
