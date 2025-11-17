import { Routes } from '@angular/router';
import { ContactList } from './pages/contact-list/contact-list';
import { ContactDetail } from './pages/contact-details/contact-details';
import { ContactForm } from './pages/contact-form/contact-form';
import { PageNotFound } from './pages/page-not-found/page-not-found';

export const routes: Routes = [
    { path: '', redirectTo: 'contacts', pathMatch: 'full' },
    { path: 'contacts', component: ContactList },
    { path: 'contacts/new', component: ContactForm },
    { path: 'contacts/:id/edit', component: ContactForm },
    { path: 'contacts/:id', component: ContactDetail },
    { path: '**', component: PageNotFound }
];