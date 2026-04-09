<?php

namespace App\Mail;

use App\Models\Campaign;
use App\Models\CampaignRecipient;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Headers;
use Illuminate\Queue\SerializesModels;

class CampaignMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Campaign $campaign,
        public readonly CampaignRecipient $campaignRecipient,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->campaign->subject,
        );
    }

    public function headers(): Headers
    {
        // Gmail要件のList-Unsubscribeヘッダーを付与
        $unsubscribeUrl = url('/unsubscribe/' . $this->campaignRecipient->tracking_id);

        return new Headers(
            text: [
                'List-Unsubscribe' => '<' . $unsubscribeUrl . '>',
                'List-Unsubscribe-Post' => 'List-Unsubscribe=One-Click',
            ],
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.campaign',
        );
    }
}
