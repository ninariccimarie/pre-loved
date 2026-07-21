import {
  LISTING_CONDITIONS,
  LISTING_STATUSES,
  CONDITION_LABELS,
  STATUS_LABELS,
  type Listing,
  type ListingInput,
} from '#/lib/types'

type ListingFormProps = {
  initial?: Listing
  onSubmit: (input: ListingInput) => Promise<void>
  onCancel: () => void
  submitting?: boolean
}

const ListingForm = ({
  initial,
  onSubmit,
  onCancel,
  submitting = false,
}: ListingFormProps) => {
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const photosRaw = String(form.get('photos') ?? '')
    const photos = photosRaw
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

    await onSubmit({
      title: String(form.get('title') ?? '').trim(),
      price: Number(form.get('price') ?? 0),
      status: String(form.get('status') ?? 'available') as ListingInput['status'],
      description: String(form.get('description') ?? '').trim(),
      condition: String(form.get('condition') ?? 'like_new') as ListingInput['condition'],
      photos,
    })
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-semibold">
          Title
        </label>
        <input
          id="title"
          name="title"
          className="demo-input"
          defaultValue={initial?.title ?? ''}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="price" className="mb-1 block text-sm font-semibold">
            Price (SGD, 0 = Free)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            className="demo-input"
            defaultValue={initial?.price ?? 0}
            required
          />
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-sm font-semibold">
            Status
          </label>
          <select id="status" name="status" className="demo-select" defaultValue={initial?.status ?? 'available'}>
            {LISTING_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="condition" className="mb-1 block text-sm font-semibold">
          Condition
        </label>
        <select
          id="condition"
          name="condition"
          className="demo-select"
          defaultValue={initial?.condition ?? 'like_new'}
        >
          {LISTING_CONDITIONS.map((condition) => (
            <option key={condition} value={condition}>
              {CONDITION_LABELS[condition]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-semibold">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          className="demo-textarea"
          defaultValue={initial?.description ?? ''}
          required
        />
      </div>

      <div>
        <label htmlFor="photos" className="mb-1 block text-sm font-semibold">
          Photo URLs (one per line)
        </label>
        <textarea
          id="photos"
          name="photos"
          className="demo-textarea min-h-28"
          defaultValue={initial?.photos.join('\n') ?? ''}
          placeholder={'https://pub-xxxxx.r2.dev/items/photo-1.jpg\nhttps://cdn.yourdomain.com/photo-2.jpg'}
          required
        />
        <p className="mt-1 text-xs text-[var(--sea-ink-soft)]">
          Paste public https links, one per line. Cloudflare R2 works with a public{' '}
          <code className="text-[0.7rem]">r2.dev</code> URL or a custom domain on your bucket.
          Presigned R2 links are also fine.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" className="demo-button demo-button-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="demo-button" disabled={submitting}>
          {submitting ? 'Saving…' : initial ? 'Update listing' : 'Create listing'}
        </button>
      </div>
    </form>
  )
}

export default ListingForm
