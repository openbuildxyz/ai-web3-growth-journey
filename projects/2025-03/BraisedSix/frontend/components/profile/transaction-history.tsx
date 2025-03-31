"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, ChevronLeft, ChevronRight } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Transaction {
  id: string
  type: "task_created" | "task_accepted" | "task_completed" | "bounty_received" | "bounty_paid"
  amount: string
  timestamp: number
  hash: string
  taskId?: number
  taskTitle?: string
}

export function TransactionHistory() {
  const [currentPage, setCurrentPage] = useState(1)
  const [transactions] = useState<Transaction[]>([
    {
      id: "1",
      type: "task_created",
      amount: "100 USDC",
      timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
      hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      taskId: 1,
      taskTitle: "Build a DeFi Dashboard",
    },
    {
      id: "2",
      type: "task_accepted",
      amount: "0 USDC",
      timestamp: Date.now() - 1.5 * 24 * 60 * 60 * 1000, // 1.5 days ago
      hash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      taskId: 2,
      taskTitle: "Smart Contract Audit",
    },
    {
      id: "3",
      type: "task_completed",
      amount: "0 USDC",
      timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
      hash: "0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456",
      taskId: 2,
      taskTitle: "Smart Contract Audit",
    },
    {
      id: "4",
      type: "bounty_received",
      amount: "200 USDC",
      timestamp: Date.now() - 0.5 * 24 * 60 * 60 * 1000, // 12 hours ago
      hash: "0xdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abc",
      taskId: 2,
      taskTitle: "Smart Contract Audit",
    },
  ])

  const getTransactionTypeLabel = (type: Transaction["type"]) => {
    switch (type) {
      case "task_created":
        return "Task Created"
      case "task_accepted":
        return "Task Accepted"
      case "task_completed":
        return "Task Completed"
      case "bounty_received":
        return "Bounty Received"
      case "bounty_paid":
        return "Bounty Paid"
      default:
        return "Unknown"
    }
  }

  const getTransactionTypeBadge = (type: Transaction["type"]) => {
    switch (type) {
      case "task_created":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800"
          >
            Task Created
          </Badge>
        )
      case "task_accepted":
        return (
          <Badge
            variant="outline"
            className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800"
          >
            Task Accepted
          </Badge>
        )
      case "task_completed":
        return (
          <Badge
            variant="outline"
            className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800"
          >
            Task Completed
          </Badge>
        )
      case "bounty_received":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800"
          >
            Bounty Received
          </Badge>
        )
      case "bounty_paid":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800"
          >
            Bounty Paid
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const formatAddress = (hash: string) => {
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`
  }

  const openExplorer = (hash: string) => {
    // For demo purposes, we'll use Ethereum mainnet explorer
    const explorerUrl = `https://etherscan.io/tx/${hash}`
    window.open(explorerUrl, "_blank")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Transaction</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  {getTransactionTypeBadge(transaction.type)}
                  {transaction.taskTitle && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Task #{transaction.taskId}: {transaction.taskTitle}
                    </div>
                  )}
                </TableCell>
                <TableCell>{transaction.amount}</TableCell>
                <TableCell>{formatDistanceToNow(transaction.timestamp, { addSuffix: true })}</TableCell>
                <TableCell>{formatAddress(transaction.hash)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openExplorer(transaction.hash)}>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={true} // Disabled for demo
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

