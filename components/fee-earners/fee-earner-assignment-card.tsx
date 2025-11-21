'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User, UserPlus, UserCheck } from 'lucide-react'
import { AssignmentDialog } from './assignment-dialog'

interface FeeEarner {
  full_name: string
  email: string
}

interface FeeEarnerAssignmentCardProps {
  matterId: string
  matterType: string
  transactionValue: number
  tenantId: string
  currentFeeEarner?: FeeEarner | null
  userRole: string
}

export function FeeEarnerAssignmentCard({
  matterId,
  matterType,
  transactionValue,
  tenantId,
  currentFeeEarner,
  userRole,
}: FeeEarnerAssignmentCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Only managers+ can assign/reassign fee earners
  const canAssign = ['owner', 'admin', 'manager'].includes(userRole)

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-purple-100 p-2">
              <User className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Fee Earner</p>
              {currentFeeEarner ? (
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {currentFeeEarner.full_name}
                  </p>
                  <p className="text-xs text-gray-500">{currentFeeEarner.email}</p>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold text-gray-500">Unassigned</p>
                  {canAssign && (
                    <Badge variant="outline" className="text-orange-600 border-orange-600">
                      Action Required
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          {canAssign && (
            <Button
              variant={currentFeeEarner ? 'outline' : 'default'}
              size="sm"
              onClick={() => setIsDialogOpen(true)}
            >
              {currentFeeEarner ? (
                <>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Reassign
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Assign
                </>
              )}
            </Button>
          )}
        </div>
      </Card>

      <AssignmentDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        matterId={matterId}
        matterType={matterType}
        transactionValue={transactionValue}
        tenantId={tenantId}
      />
    </>
  )
}
