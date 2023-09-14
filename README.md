# IMAP-Extracting-Mails-From-Mailbox

This repository contains a Node.js script for extracting specific emails from a mailbox using the IMAP protocol. It is designed to retrieve unseen messages with attachments based on the sender's email address and a specified identifier in the email subject.

## Features

- Connects to an IMAP server and opens the mailbox.
- Searches for unseen emails that match specific criteria (sender's email and subject identifier).
- Parses the content and attachments of the selected emails.
- Marks retrieved emails as "seen" to prevent duplicate processing.
- Provides a useful utility for automating email processing tasks.

## Usage

1. Set your IMAP server details and authentication credentials in the script.
2. Customize the search criteria (sender's email and subject identifier) as needed.
3. Run the script to extract and process specific emails from the mailbox.

## Prerequisites

- Node.js and npm installed on your system.
- Ensure the required npm packages, such as "imap" and "mailparser," are installed.

## Configuration

Modify the IMAP server configuration and search criteria in the script to suit your needs.
