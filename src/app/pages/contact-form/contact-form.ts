import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ContactService, Contact } from '../../services/contact.service';

@Component({
  selector: 'app-contact-form',
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInputModule,
    MatError,
    MatButtonModule,
    CommonModule
  ],
  templateUrl: './contact-form.html',
  styleUrl: './contact-form.css'
})
export class ContactForm implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private contactService = inject(ContactService);
  private router = inject(Router);

  contactId = signal<number | null>(null);
  editMode = signal(false);

  contactForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    cell: ['', [Validators.required]],
    street: ['', [Validators.required]],
    city: ['', [Validators.required]],
    state: [''],
    postalCode: ['', [Validators.required]],
    country: ['', [Validators.required]],
    age: [0, [Validators.required, Validators.min(1), Validators.max(150)]],
    image: ['']
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const url = this.route.snapshot.url.map(s => s.path);

    if (url.includes('edit') && idParam !== null) {
      const id = Number(idParam);
      this.editMode.set(true);
      this.contactId.set(id);
      this.loadContact(id);
    }
  }

  loadContact(id: number) {
    this.contactService.getContactDetails(id).subscribe({
      next: (contact: Contact) => {
        this.contactForm.patchValue(contact);
      },
      error: err => console.error('Failed to load contact', err),
    });
  }

  scrollToFirstInvalidField() {
    for (const key of Object.keys(this.contactForm.controls)) {
      const control = this.contactForm.get(key);
      if (control && control.invalid) {
        const element = document.querySelector(
          `[formControlName="${key}"]`
        ) as HTMLElement;
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
        break;
      }
    }
  }

  onSubmit() {
    this.contactForm.markAllAsTouched();
    if (!this.contactForm.valid) {
      this.scrollToFirstInvalidField();
      return;
    }

    const payload = this.contactForm.value;
    if (this.contactService.isServerOnline()) {
      if (this.editMode() && this.contactId()) {
        this.contactService.updateContact(this.contactId()!, payload).subscribe({
          next: () => this.router.navigate(['/contacts']),
          error: () => alert('Error updating contact'),
        });
      }

      if (!this.contactService.isServerOnline()) {
        this.contactService.addContactTask({ type: 'update', data: { id: this.contactId(), ...payload } });
        alert("Offline. Update saved and will sync when online.");
        this.router.navigate(['/contacts']);
        return;
      }
    } else {
      if (this.contactService.isServerOnline()) {
        this.contactService.submitContactForm(payload).subscribe({
          next: () => {
            this.router.navigate(['/contacts']);
          },
          error: () => alert('Error submitting form'),
        });
      }
      if (!this.contactService.isServerOnline()) {
        this.contactService.addContactTask({ data: payload, type: 'create' });
        alert("You are offline. Contact stored and will sync automatically.");
        this.router.navigate(['/contacts']);
        return;
      }
    }

  }

  onCancelClick() {
    if (this.editMode() && this.contactId()) {
      this.router.navigate(['/contacts', this.contactId()]);
    } else {
      this.router.navigate(['/contacts']);
    }
  }
}