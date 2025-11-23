/**
 * CSV Export Utilities
 * Pure functions for CSV generation (no server dependencies)
 */

/**
 * Convert an array of objects to CSV string
 */
export function exportToCSV(data: any[], filename: string): string {
  if (!data || data.length === 0) return ''

  const headers = Object.keys(data[0])

  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header]
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        })
        .join(',')
    ),
  ].join('\n')

  return csvContent
}
