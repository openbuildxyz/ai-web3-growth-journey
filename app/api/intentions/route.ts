export const runtime = 'edge';

/**
 * GET /api/intentions
 * 返回预设的冥想意图列表
 */
export async function GET() {
    // 预设的冥想意图列表
    const intentions = [
        "助眠",
        "减压",
        "专注",
        "恢复精力",
        "缓解焦虑",
        "提升创造力"
    ];

    return Response.json(intentions, {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            // 允许跨域访问（如果需要）
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
} 