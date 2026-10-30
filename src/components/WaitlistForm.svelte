<script lang="ts">
  import { isValidEmail, submitWaitlist } from '../lib/waitlist';
  import Mascot from './Mascot.svelte';

  let { endpoint }: { endpoint?: string } = $props();

  type Status = 'editing' | 'invalid' | 'submitting' | 'failed' | 'joined';

  const HINTS: Record<Exclude<Status, 'joined'>, string> = {
    editing: 'Free. One email when your invite is ready.',
    invalid: 'That email doesn’t look right. Check it and try again.',
    submitting: 'Adding you to the list…',
    failed: 'We couldn’t add you just now. Try again in a moment.',
  };

  const id = $props.id();
  let email = $state('');
  let status = $state<Status>('editing');

  async function join(event: SubmitEvent) {
    event.preventDefault();
    if (!isValidEmail(email)) {
      status = 'invalid';
      return;
    }
    status = 'submitting';
    try {
      await submitWaitlist(email, endpoint);
      email = email.trim();
      status = 'joined';
    } catch {
      status = 'failed';
    }
  }

  function resumeEditing() {
    if (status === 'invalid' || status === 'failed') status = 'editing';
  }
</script>

<div class="waitlist">
  {#if status === 'joined'}
    <div class="thanks" role="status">
      <Mascot mood="thanks" size={52} />
      <p class="display-wide">Thanks! We'll email {email} when early access opens.</p>
    </div>
  {:else}
    <form onsubmit={join} novalidate>
      <label class="visually-hidden" for="{id}-email">Your email</label>
      <input
        id="{id}-email"
        type="email"
        autocomplete="email"
        placeholder="Your email"
        bind:value={email}
        oninput={resumeEditing}
        aria-invalid={status === 'invalid'}
        aria-describedby="{id}-hint"
      />
      <button type="submit" disabled={status === 'submitting'}>Join the waitlist</button>
    </form>
    <p id="{id}-hint" class="hint" aria-live="polite">{HINTS[status]}</p>
  {/if}
</div>

<style>
  .waitlist {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 560px;
  }

  form {
    display: flex;
    gap: 4px;
    height: 64px;
  }

  input {
    flex: 1;
    min-width: 0;
    border: 0;
    outline: 0;
    border-radius: 32px 10px 10px 32px;
    background: var(--hero-field);
    padding: 0 24px;
    font-weight: 500;
    font-size: 17px;
    color: var(--on-surface);
  }

  input::placeholder {
    color: var(--on-surface-variant);
  }

  input:focus-visible {
    box-shadow: inset 0 0 0 3px var(--p80);
  }

  input[aria-invalid='true'] {
    box-shadow: inset 0 0 0 3px var(--error-container);
  }

  button {
    flex: none;
    display: flex;
    align-items: center;
    padding: 0 28px;
    border: 0;
    border-radius: 10px 32px 32px 10px;
    background: var(--accent);
    color: var(--on-accent);
    font-weight: 700;
    font-size: 17px;
    cursor: pointer;
    transition:
      border-radius 394ms var(--sf),
      transform 394ms var(--sf);
  }

  button:active {
    border-radius: 16px;
    transform: scale(0.97);
  }

  button:disabled {
    cursor: progress;
    opacity: 0.8;
  }

  .hint {
    font-size: 14px;
    opacity: 0.85;
    padding: 0 8px;
  }

  .thanks {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 18px;
    border-radius: 32px;
    background: var(--card);
    color: var(--on-surface);
  }

  .thanks p {
    font-size: 24px;
    overflow-wrap: anywhere;
  }

  @media (max-width: 480px) {
    form {
      flex-direction: column;
      height: auto;
    }

    input,
    button {
      flex: none;
      height: 60px;
      border-radius: 30px 30px 10px 10px;
    }

    button {
      justify-content: center;
      border-radius: 10px 10px 30px 30px;
    }

    .thanks p {
      font-size: 20px;
    }
  }
</style>
