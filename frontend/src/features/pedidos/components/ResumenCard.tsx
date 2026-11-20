import Card from '../../../shared/ui/Card'

interface ResumenCardProps {
  titulo: string
  valor: string
}

export default function ResumenCard({ titulo, valor }: ResumenCardProps) {
  return (
    <Card className="flex flex-col gap-1">
      <span className="text-sm text-gray-600">{titulo}</span>
      <span className="text-2xl font-bold">{valor}</span>
    </Card>
  )
}