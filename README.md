# Section Zero

A central pre-arrival platform built for incoming Darden students to navigate the chaotic runway to business school. This application parses, structures, and transforms massive, unstructured peer-to-peer WhatsApp chat logs into an actionable, mobile-first dashboard. 

---

## 🎯 The Problem & The Solution

Before arriving on campus, incoming MBA cohorts exchange thousands of critical messages containing recruiting links, housing leads, and logistics advice. Important details quickly get buried in chat history. 

**Section Zero** acts as the definitive knowledge base—saving students from scrolling endlessly through text archives by converting conversational data into organized, intuitive UI components.

---

## 💻 Key Features

*   **Recruitment Track Filters:** A curated knowledge dump for **Consulting, Investment Banking, and Tech**. It filters chat logs to surface active peer-shared prep folders, Google Drive links, and WhatsApp sub-club invites.
*   **Classifieds Marketplace:** A live, operational peer board for housing subleases and moving sales. Features a light infrastructure form that accepts external media links (Google Drive, OneDrive) to bypass server storage limits while instantly populating the feed upon refresh.
*   **Smart Media Matching:** Utilizes a custom time-window proximity algorithm to accurately cluster and link image attachments and PDFs to their corresponding text descriptions based on sender timestamps.
*   **Personal Onboarding Tracker:** A built-in, browser-persisted to-do list allowing students to seamlessly track their pre-arrival tasks.

---

## 🎨 Design & Brand Identity

The interface is built to feel immediately familiar to the cohort, matching the official Darden identity:
*   **Primary Palette:** Deep Navy and Vibrant Orange action branding.
*   **User Experience:** Designed specifically for mobile scannability, recognizing that students access this information on the go.

---

## 🔍 Note for Recruiters & Visitors

This project demonstrates an end-to-end product development lifecycle:
1. **Identifying a User Friction Point:** Recognizing data fragmentation within a high-engagement community.
2. **Technical Problem Solving:** Architecting a parsing engine to clean messy string data and mapping it to structural JSON layouts without data duplication.
3. **Resource Constraint Engineering:** Implementing a link-based media submission model to ensure zero backend storage costs while preserving the frontend visual layout.

**[Check it out here: Section Zero: Grad Cohort Onboarding](https://section-zero.bolt.host/)**