import { Star } from 'lucide-react';
import type { Review } from '@shared/types';
import { CONTACT } from '@shared/constants';
import { Card } from './ui/card';
import { Button } from './ui/button';

interface ReviewCarouselProps {
  reviews: Review[];
}

function formatReviewDate(timestamp: number) {
  return new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric' }).format(new Date(timestamp));
}

export function ReviewCarousel({ reviews }: ReviewCarouselProps) {
  if (reviews.length === 0) return null;

  return (
    <section className="space-y-3" aria-label="Avaliações reais no Google">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="subtle-label">Avaliações reais no Google</p>
          <h2 className="section-title">Famílias que confiam na Dra. Bárbara</h2>
        </div>
        <a href={CONTACT.googleReviewsUrl} target="_blank" rel="noopener noreferrer" className="hidden sm:block">
          <Button variant="outline" className="rounded-full">Ver todas</Button>
        </a>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-3 snap-x" aria-label="Avaliações de pacientes no Google">
        {reviews.slice(0, 8).map((review) => (
          <Card key={review.id} className="min-w-[280px] snap-start rounded-[1.5rem] border-white/80 bg-white p-5 shadow-[0_12px_32px_rgba(61,44,34,0.07)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_38px_rgba(61,44,34,0.1)] sm:min-w-[330px]">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex gap-0.5 text-[#F3B64B]" aria-label={`${review.rating} estrelas`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} className={i < review.rating ? 'fill-current' : 'text-muted'} />
                ))}
              </div>
              <span className="rounded-full bg-[#EAF5EF] px-3 py-1 text-[11px] font-bold text-[#4D8763]">Google</span>
            </div>
            <p className="text-4xl leading-none text-primary/25">&quot;</p>
            <p className="-mt-2 line-clamp-3 text-sm italic leading-relaxed text-[#6F5B50]">{review.text}</p>
            <div className="mt-4 border-t border-[#F3E8E1] pt-3">
              <p className="font-extrabold text-[#3D2C22]">{review.author}</p>
              <p className="text-xs text-muted-foreground">Avaliação verificada · {formatReviewDate(review.date)}</p>
            </div>
          </Card>
        ))}
        <a href={CONTACT.googleReviewsUrl} target="_blank" rel="noopener noreferrer" className="min-w-[220px] snap-start">
          <Card className="flex h-full min-h-[210px] flex-col items-center justify-center rounded-[1.5rem] border-primary/20 bg-primary/5 p-5 text-center">
            <p className="font-black text-[#3D2C22]">Mais avaliações no Google</p>
            <p className="mt-2 text-sm text-muted-foreground">Veja o perfil da Dra. Bárbara e confira outros relatos reais.</p>
            <Button className="mt-4 rounded-full">Ver no Google</Button>
          </Card>
        </a>
        <a href={CONTACT.googleReviewWriteUrl} target="_blank" rel="noopener noreferrer" className="min-w-[220px] snap-start">
          <Card className="flex h-full min-h-[210px] flex-col items-center justify-center rounded-[1.5rem] border-secondary/30 bg-secondary/10 p-5 text-center">
            <p className="font-black text-[#3D2C22]">Já foi atendido?</p>
            <p className="mt-2 text-sm text-muted-foreground">Sua avaliação ajuda outras famílias a encontrarem cuidado seguro.</p>
            <Button variant="outline" className="mt-4 rounded-full">Avaliar atendimento</Button>
          </Card>
        </a>
      </div>
    </section>
  );
}
